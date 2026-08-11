import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import path from 'path';
import fs from 'fs';

// @desc    Get all documents for a client
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const { caseId, documentType, search } = req.query;

    const whereClause: any = {
      case: {
        userId: req.user.id,
      },
    };

    if (caseId) whereClause.caseId = String(caseId);
    if (documentType) whereClause.documentType = String(documentType);
    if (search) {
      whereClause.fileName = {
        contains: String(search),
        mode: 'insensitive',
      };
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        case: { select: { title: true, caseNumber: true } },
        uploadedBy: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    if (!req.file) {
      res.status(400);
      throw new Error('No file provided');
    }

    const { caseId, documentType, description } = req.body;

    if (!caseId || !documentType) {
      // Clean up file if missing required fields
      fs.unlinkSync(req.file.path);
      res.status(400);
      throw new Error('caseId and documentType are required');
    }

    // Verify case belongs to user
    const caseRecord = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseRecord || caseRecord.userId !== req.user.id) {
      fs.unlinkSync(req.file.path);
      res.status(403);
      throw new Error('Forbidden: Case not found or does not belong to you');
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;

    const document = await prisma.document.create({
      data: {
        caseId,
        uploadedById: req.user.id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileUrl,
        fileSize: req.file.size,
        documentType,
        description: description || null,
      },
      include: {
        case: { select: { title: true, caseNumber: true } },
        uploadedBy: { select: { name: true, role: true } },
      }
    });

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

// @desc    Download a document
// @route   GET /api/documents/:documentId/download
// @access  Private
export const downloadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { documentId } = req.params;

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { case: true },
    });

    if (!document || document.case.userId !== req.user.id) {
      res.status(404);
      throw new Error('Document not found or access denied');
    }

    // fileUrl is e.g. "/uploads/documents/file-1234.pdf"
    // We need the absolute path
    const absolutePath = path.join(__dirname, '..', '..', document.fileUrl);

    if (!fs.existsSync(absolutePath)) {
      res.status(404);
      throw new Error('File not found on server');
    }

    res.download(absolutePath, document.fileName);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:documentId
// @access  Private
export const deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { documentId } = req.params;

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      res.status(404);
      throw new Error('Document not found');
    }

    if (document.uploadedById !== req.user.id) {
      res.status(403);
      throw new Error('Forbidden: You can only delete documents you uploaded');
    }

    // Delete from DB
    await prisma.document.delete({ where: { id: documentId } });

    // Delete from disk
    const absolutePath = path.join(__dirname, '..', '..', document.fileUrl);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
