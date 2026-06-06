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

    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: req.user.id }
    });

    if (!lawyer) {
      res.status(404);
      throw new Error('Lawyer profile not found');
    }

    const updatedLawyer = await prisma.lawyer.update({
      where: { userId: req.user.id },
      data: {
        specialization: specialization || lawyer.specialization,
        location: location || lawyer.location,
        bio: bio || lawyer.bio,
        workExperience: workExperience || lawyer.workExperience,
        profilePicture: profilePicture || lawyer.profilePicture,
        phone: phone || lawyer.phone,
        phoneVerified: phoneVerified !== undefined ? phoneVerified : lawyer.phoneVerified,
        idPhotos: idPhotos || lawyer.idPhotos,
        profileCompleted: profileCompleted !== undefined ? profileCompleted : lawyer.profileCompleted,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : lawyer.hourlyRate
      }
    });

    res.status(200).json(updatedLawyer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending lawyers for verification
// @route   GET /api/lawyers/pending
// @access  Private (Admin only)
export const getPendingLawyers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lawyers = await prisma.lawyer.findMany({
      where: {
        isVerified: false,
        profileCompleted: true
      },
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
