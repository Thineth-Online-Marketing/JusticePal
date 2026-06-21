import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

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

    const lawyer = await prisma.lawyer.upsert({
      where: { userId: req.user.id },
      update: {
        specialization: specialization || [],
        location: location || null,
        bio: bio || null,
        workExperience: workExperience || null,
        profilePicture: profilePicture || null,
        phone: phone || null,
        phoneVerified: phoneVerified !== undefined ? phoneVerified : undefined,
        idPhotos: idPhotos || undefined,
        profileCompleted: profileCompleted !== undefined ? profileCompleted : undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined
      },
      create: {
        userId: req.user.id,
        specialization: specialization || [],
        location: location || null,
        bio: bio || null,
        workExperience: workExperience || null,
        profilePicture: profilePicture || null,
        phone: phone || null,
        phoneVerified: phoneVerified !== undefined ? phoneVerified : false,
        idPhotos: idPhotos || [],
        profileCompleted: profileCompleted !== undefined ? profileCompleted : false,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null
      }
    });

    res.status(200).json(lawyer);
  } catch (error) {
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
