import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createNotification } from './notificationController';
import { sendRealTimeNotification } from '../utils/notificationHelper';
import { io } from '../index';

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

    // ── Auto-trigger: notify the lawyer about the new booking ──
    try {
      const lawyer = await prisma.lawyer.findUnique({
        where: { id: lawyerId },
        select: { userId: true },
      });
      const client = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      if (lawyer) {
        const savedNotification = await createNotification({
          userId: lawyer.userId,
          title: 'New Consultation Request',
          message: `${client?.name || 'A client'} has booked a consultation for ${new Date(scheduledAt).toLocaleDateString()}.`,
          type: 'booking',
        });
        
        // Instantly push to the lawyer's private socket room
        sendRealTimeNotification(lawyer.userId, savedNotification);
        
        // Broadcast dashboard update to lawyer
        io.to(`user:${lawyer.userId}`).emit("dashboard_update", { type: "new_booking_received", appointment });
      }

      // Broadcast dashboard update to client
      io.to(`user:${userId}`).emit("dashboard_update", { type: "booking_created" });
    } catch (notifErr) {
      console.error('Failed to create booking notification:', notifErr);
      // Don't fail the appointment creation if notification fails
    }

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

