import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import { AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from './notificationController';

const prisma = new PrismaClient();

// Helper to extract storage path from Firebase/GCS URL
const getStoragePathFromUrl = (url: string): string => {
  try {
    const decodedUrl = decodeURIComponent(url);
    if (decodedUrl.includes('/o/')) {
      // Firebase REST API format: /o/case-files%2FuserId%2Ffilename?alt=media
      const parts = decodedUrl.split('/o/');
      return parts[1].split('?')[0];
    } else if (decodedUrl.includes('.app/')) {
      // Google Cloud Storage signed URL format: .app/case-files%2FuserId%2Ffilename?GoogleAccessId=...
      const parts = decodedUrl.split('.app/');
      return parts[1].split('?')[0];
    } else if (decodedUrl.includes('storage.googleapis.com/')) {
      // Alternate format: storage.googleapis.com/bucket-name/case-files/userId/filename
      const parts = decodedUrl.split('storage.googleapis.com/');
      const pathParts = parts[1].split('/');
      pathParts.shift(); // Remove bucket name
      return pathParts.join('/').split('?')[0];
    }
  } catch (error) {
    console.error('Failed to parse storage path from URL:', error);
  }
  return '';
};

// @desc    Upload a case file / document
// @route   POST /api/case-files
// @access  Private
export const uploadCaseFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, fileContent, fileType, fileSize, appointmentId } = req.body;

    if (!name || !fileContent || !fileType) {
      res.status(400);
      throw new Error('Please provide name, fileContent (base64), and fileType');
    }

    // Determine uploader role
    const uploadedBy = req.user.role === 'lawyer' ? 'lawyer' : 'client';

    // Verify appointment exists if linked
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { lawyer: true }
      });

      if (!appointment) {
        res.status(404);
        throw new Error('Linked appointment not found');
      }

      // Authorize: Only the appointment uploader (client) or lawyer can upload to it
      const isClient = appointment.userId === req.user.id;
      const isLawyer = appointment.lawyer.userId === req.user.id;
      if (!isClient && !isLawyer && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to link files to this appointment');
      }
    }

    let url = '';
    const fileBuffer = Buffer.from(fileContent, 'base64');
    
    try {
      // Initialize Firebase Storage
      const bucket = admin.storage().bucket();
      const uniqueFilename = `${Date.now()}_${name}`;
      const filePath = `case-files/${req.user.id}/${uniqueFilename}`;
      const fileRef = bucket.file(filePath);

      // Save to Firebase Storage
      await fileRef.save(fileBuffer, {
        metadata: {
          contentType: fileType,
        },
      });

      // Generate a long-lived Signed URL for secure access
      const expiresDate = new Date();
      expiresDate.setFullYear(expiresDate.getFullYear() + 10);
      
      const [signedUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: expiresDate,
      });
      url = signedUrl;
    } catch (storageError: any) {
      console.warn("Firebase Storage upload failed, using secure data URL fallback:", storageError.message);
      // Fallback: use data URL to preserve actual file content offline without Google Cloud clock synchronization dependencies
      url = `data:${fileType};base64,${fileContent}`;
    }

    // Save metadata in PostgreSQL using Prisma
    const caseFile = await prisma.caseFile.create({
      data: {
        name,
        url,
        fileType,
        fileSize: fileSize ? parseInt(fileSize) : fileBuffer.length,
        uploadedBy,
        userId: req.user.id,
        appointmentId: appointmentId || null,
      },
      include: {
        user: {
          select: { name: true, role: true, firebaseUid: true }
        }
      }
    });

    res.status(201).json(caseFile);

    // ── Auto-trigger: notify the other party in the appointment ──
    if (appointmentId) {
      try {
        const appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId },
          include: { lawyer: { select: { userId: true } }, user: { select: { id: true } } },
        });
        if (appointment) {
          // If uploader is the client, notify the lawyer; and vice versa
          const recipientUserId =
            req.user.id === appointment.user.id
              ? appointment.lawyer.userId
              : appointment.user.id;
          await createNotification({
            userId: recipientUserId,
            title: 'New Document Uploaded',
            message: `"${name}" has been uploaded to your consultation.`,
            type: 'info',
          });
        }
      } catch (notifErr) {
        console.error('Failed to create file-upload notification:', notifErr);
      }
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all accessible case files
// @route   GET /api/case-files
// @access  Private
export const getCaseFiles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const appointmentId = req.query.appointmentId as string;

    // Build authorization check where the user is either:
    // 1. The owner who uploaded it
    // 2. Or the client / lawyer in the associated appointment
    const whereClause: any = {
      OR: [
        { userId: req.user.id },
        {
          appointment: {
            OR: [
              { userId: req.user.id },
              { lawyer: { userId: req.user.id } }
            ]
          }
        }
      ]
    };

    // If filtering by a specific appointment, refine whereClause
    if (appointmentId) {
      whereClause.appointmentId = appointmentId;
    }

    const files = await prisma.caseFile.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, role: true, firebaseUid: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(files);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a case file
// @route   DELETE /api/case-files/:id
// @access  Private
export const deleteCaseFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const file = await prisma.caseFile.findUnique({
      where: { id }
    });

    if (!file) {
      res.status(404);
      throw new Error('Case file not found');
    }

    // Authorization: Only the owner (uploader) or admin can delete it
    if (file.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this case file');
    }

    // Try to delete physical file from Firebase Storage
    const storagePath = getStoragePathFromUrl(file.url);
    if (storagePath) {
      try {
        const bucket = admin.storage().bucket();
        await bucket.file(storagePath).delete();
      } catch (storageError: any) {
        // If file doesn't exist in storage anymore, log it but proceed to delete database entry
        console.error(`Firebase file deletion failed for ${storagePath}:`, storageError.message);
      }
    }

    // Delete database entry
    await prisma.caseFile.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: 'Case file deleted successfully' });
  } catch (error) {
    next(error);
  }
};
