import { Request, Response, NextFunction } from 'express';
import Appointment from '../models/Appointment';

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await Appointment.find()
      .populate('userId', 'name email')
      .populate('lawyerId', 'specialization');
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

    const appointment = await Appointment.create({
      userId,
      lawyerId,
      scheduledAt,
      caseDescription
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};
