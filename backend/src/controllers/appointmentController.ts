import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        lawyer: { select: { specialization: true } }
      }
    });
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

// @desc    Create an appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, lawyerId, scheduledAt, caseDescription } = req.body;

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        lawyerId,
        scheduledAt: new Date(scheduledAt),
        caseDescription
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};
