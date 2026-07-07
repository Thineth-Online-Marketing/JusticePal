import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

// @desc    Get all lawyers
// @route   GET /api/lawyers
// @access  Public
export const getLawyers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lawyers = await prisma.lawyer.findMany({
      where: { isVerified: true },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    res.status(200).json(lawyers);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a lawyer profile
// @route   POST /api/lawyers
// @access  Private (Needs Auth)
export const createLawyerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, specialization, location, bio, hourlyRate } = req.body;

    const lawyerExists = await prisma.lawyer.findUnique({
      where: { userId }
    });

    if (lawyerExists) {
      res.status(400);
      throw new Error('Lawyer profile already exists for this user');
    }

    const lawyer = await prisma.lawyer.create({
      data: {
        userId,
        specialization,
        location,
        bio,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null
      }
    });

    res.status(201).json(lawyer);
  } catch (error) {
    next(error);
  }
};

// @desc    Update lawyer profile (for onboarding)
// @route   PUT /api/lawyers/profile
// @access  Private (Lawyer)
export const updateLawyerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { specialization, location, bio, hourlyRate, workExperience, profilePicture, phone, phoneVerified, idPhotos, profileCompleted } = req.body;
    const userId = req.user.id;

    // 1. Data Sanitization & Parsing
    // Ensure specialization is a flattened, clean string array
    let safeSpecialization: string[] | undefined = undefined;
    if (specialization !== undefined) {
      safeSpecialization = Array.isArray(specialization) 
        ? specialization.flat() 
        : [specialization];
    }

    // 2. Safe Fallbacks & Prisma Writes
    // (Note: phone and profilePicture are in the Lawyer schema, not User)
    const lawyer = await prisma.lawyer.upsert({
      where: { userId },
      update: {
        specialization: safeSpecialization,
        location: location !== undefined ? location : undefined,
        bio: bio !== undefined ? bio : undefined,
        // Using String() to match the DB schema's String? type, 
        // fallback to undefined for safe partial updates
        workExperience: workExperience !== undefined ? String(workExperience) : undefined,
        profilePicture: profilePicture !== undefined ? profilePicture : undefined,
        phone: phone !== undefined ? phone : undefined,
        phoneVerified: phoneVerified !== undefined ? phoneVerified : undefined,
        idPhotos: idPhotos !== undefined ? idPhotos : undefined,
        profileCompleted: profileCompleted !== undefined ? profileCompleted : undefined,
        hourlyRate: hourlyRate !== undefined ? parseFloat(hourlyRate) : undefined
      },
      create: {
        userId,
        specialization: safeSpecialization || [],
        location: location || null,
        bio: bio || null,
        workExperience: workExperience !== undefined ? String(workExperience) : null,
        profilePicture: profilePicture || null,
        phone: phone || null,
        phoneVerified: phoneVerified || false,
        idPhotos: idPhotos || [],
        profileCompleted: profileCompleted || false,
        hourlyRate: hourlyRate !== undefined ? parseFloat(hourlyRate) : null
      }
    });

    res.status(200).json(lawyer);
  } catch (error) {
    console.error("Profile update error:", error);
    next(error);
  }
};

// @desc    Get all lawyers for admin verification page
// @route   GET /api/lawyers/pending
// @access  Private (Admin only)
export const getPendingLawyers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lawyers = await prisma.lawyer.findMany({
      where: {
        profileCompleted: true
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(lawyers);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a lawyer profile
// @route   PUT /api/lawyers/:id/verify
// @access  Private (Admin only)
export const verifyLawyer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const lawyer = await prisma.lawyer.findUnique({
      where: { id }
    });

    if (!lawyer) {
      res.status(404);
      throw new Error('Lawyer profile not found');
    }

    const updatedLawyer = await prisma.lawyer.update({
      where: { id },
      data: { isVerified: true },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(200).json(updatedLawyer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get lawyer by ID
// @route   GET /api/lawyers/:id
// @access  Public
export const getLawyerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const lawyer = await prisma.lawyer.findFirst({
      where: {
        OR: [
          { id: id },
          { userId: id }
        ]
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!lawyer) {
      res.status(404);
      throw new Error('Lawyer profile not found');
    }

    res.status(200).json(lawyer);
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a lawyer profile
// @route   PUT /api/lawyers/:id/reject
// @access  Private (Admin only)
export const rejectLawyer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const lawyer = await prisma.lawyer.findUnique({
      where: { id }
    });

    if (!lawyer) {
      res.status(404);
      throw new Error('Lawyer profile not found');
    }

    const updatedLawyer = await prisma.lawyer.update({
      where: { id },
      data: {
        isVerified: false,
        profileCompleted: false,
        rejectedReason: reason || 'Application rejected by admin'
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(200).json(updatedLawyer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get lawyer analytics
// @route   GET /api/lawyers/:id/analytics
// @access  Private (Lawyer)
export const getLawyerAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const lawyer = await prisma.lawyer.findUnique({
      where: { id }
    });

    if (!lawyer) {
      res.status(404);
      throw new Error('Lawyer profile not found');
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
    const currentDate = new Date();

    const earnings = await prisma.payment.aggregate({
      where: {
        appointment: { lawyerId: id },
        status: { in: ['succeeded', 'completed'] },
        createdAt: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: {
        amount: true
      }
    });

    const totalEarnings = earnings._sum.amount || 0;

    const appointmentBreakdown = await prisma.appointment.groupBy({
      by: ['status'],
      where: {
        lawyerId: id,
        scheduledAt: { gte: startOfMonth, lte: endOfMonth }
      },
      _count: {
        id: true
      }
    });

    let completedAppointments = 0;
    let cancelledAppointments = 0;

    appointmentBreakdown.forEach((group) => {
      if (group.status === 'completed') {
        completedAppointments = group._count.id;
      } else if (group.status === 'cancelled') {
        cancelledAppointments = group._count.id;
      }
    });

    const upcomingAppointments = await prisma.appointment.count({
      where: {
        lawyerId: id,
        status: { in: ['pending', 'confirmed'] },
        scheduledAt: { gte: currentDate }
      }
    });

    const uniqueClientsResult = await prisma.appointment.findMany({
      where: {
        lawyerId: id,
        scheduledAt: { gte: startOfMonth, lte: endOfMonth }
      },
      distinct: ['userId'],
      select: {
        userId: true
      }
    });

    const uniqueClients = uniqueClientsResult.length;

    res.status(200).json({
      success: true,
      analytics: {
        totalEarnings,
        completedAppointments,
        cancelledAppointments,
        upcomingAppointments,
        uniqueClients
      }
    });
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(500);
    }
    next(error);
  }
};

// @desc    Generate Lawyer Financial Summary PDF Report
// @route   GET /api/lawyers/report/download
// @access  Private (Lawyer)
export const generateFinancialReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    const lawyer = await prisma.lawyer.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true } }
      }
    });

    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer profile not found' });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        lawyerId: lawyer.id,
        status: { in: ['confirmed', 'scheduled'] }
      },
      include: {
        user: { select: { name: true } },
        payments: {
          where: { status: 'succeeded' }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    });

    let totalEarnings = 0;
    const reportData = appointments.map(appt => {
      const fee = appt.payments.reduce((acc, p) => acc + p.amount, 0);
      totalEarnings += fee;
      return {
        date: new Date(appt.scheduledAt).toLocaleDateString(),
        clientName: appt.user.name,
        caseDesc: appt.caseDescription.substring(0, 30) + (appt.caseDescription.length > 30 ? '...' : ''),
        fee
      };
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=Lawyer_Financial_Summary.pdf');

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('JusticePal Legal Network — Financial Summary Report', { align: 'center' });
    doc.moveDown();

    // Metadata
    doc.fontSize(12).text(`Date Generated: ${new Date().toLocaleDateString()}`);
    doc.text(`Lawyer Name: ${lawyer.user.name}`);
    doc.text(`Specialization: ${lawyer.specialization.join(', ')}`);
    doc.text(`Total Consultations: ${appointments.length}`);
    doc.moveDown(2);

    // Table Header
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Date', 50, doc.y, { continued: true, width: 100 });
    doc.text('Client Name', 150, doc.y, { continued: true, width: 150 });
    doc.text('Case Description', 300, doc.y, { continued: true, width: 180 });
    doc.text('Fee (LKR)', 480, doc.y);
    
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown();

    // Table Rows
    doc.font('Helvetica');
    reportData.forEach(row => {
      const y = doc.y;
      doc.text(row.date, 50, y, { width: 100 });
      doc.text(row.clientName, 150, y, { width: 150 });
      doc.text(row.caseDesc, 300, y, { width: 180 });
      doc.text(row.fee.toString(), 480, y);
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Footer Summary
    doc.fontSize(14).font('Helvetica-Bold').text(`Total Earnings: ${totalEarnings} LKR`, { align: 'right' });

    doc.end();
  } catch (error) {
    next(error);
  }
};
