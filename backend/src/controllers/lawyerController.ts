import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all lawyers
// @route   GET /api/lawyers
// @access  Public
export const getLawyers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lawyers = await prisma.lawyer.findMany({
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
