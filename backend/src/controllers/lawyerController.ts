import { Request, Response, NextFunction } from 'express';
import Lawyer from '../models/Lawyer';

// @desc    Get all lawyers
// @route   GET /api/lawyers
// @access  Public
export const getLawyers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lawyers = await Lawyer.find().populate('userId', 'name email');
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

    const lawyerExists = await Lawyer.findOne({ userId });

    if (lawyerExists) {
      res.status(400);
      throw new Error('Lawyer profile already exists for this user');
    }

    const lawyer = await Lawyer.create({
      userId,
      specialization,
      location,
      bio,
      hourlyRate
    });

    res.status(201).json(lawyer);
  } catch (error) {
    next(error);
  }
};
