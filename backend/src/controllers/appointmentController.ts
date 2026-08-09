import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createNotification } from './notificationController';
import { sendRealTimeNotification } from '../utils/notificationHelper';
import { io } from '../index';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Get all appointments (Filtered by role)
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    let whereClause = {};
    if (req.user.role === 'lawyer') {
      const lawyer = await prisma.lawyer.findUnique({ where: { userId: req.user.id } });
      if (lawyer) {
        whereClause = { lawyerId: lawyer.id };
      }
    } else {
      whereClause = { userId: req.user.id };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
        lawyer: { select: { id: true, specialization: true, user: { select: { name: true } } } }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

// @desc    Create an appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lawyerId, date, timeSlot, notes } = req.body;
    
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const userId = req.user.id;

    // Parse date and timeSlot into scheduledAt
    // e.g. date: '2026-08-10', timeSlot: '10:00 AM'
    let scheduledAt = new Date();
    if (date && timeSlot) {
      const dateObj = new Date(date);
      const timeParts = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const ampm = timeParts[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        dateObj.setHours(hours, minutes, 0, 0);
        scheduledAt = dateObj;
      } else {
        scheduledAt = new Date(date);
      }
    }

    const appointment = await prisma.$transaction(async (tx) => {
      // Step A: Create the Appointment record
      const newAppointment = await tx.appointment.create({
        data: {
          userId,
          lawyerId,
          scheduledAt,
          status: 'scheduled',
          caseDescription: notes || 'No specific notes provided.'
        },
        include: {
          user: { select: { name: true } },
          lawyer: { select: { userId: true } }
        }
      });

      // Fetch lawyer to get hourlyRate
      const lawyer = await tx.lawyer.findUnique({
        where: { id: lawyerId }
      });
      const amount = lawyer?.hourlyRate || 5000; // Default amount if not set

      // Step B: Create corresponding Payment record
      await tx.payment.create({
        data: {
          appointmentId: newAppointment.id,
          amount,
          status: 'pending',
          currency: 'LKR'
        }
      });

      return newAppointment;
    });

    // ── Auto-trigger: notify the lawyer about the new booking ──
    try {
      const lawyerUserId = appointment.lawyer.userId;
      if (lawyerUserId) {
        const savedNotification = await createNotification({
          userId: lawyerUserId,
          title: 'New Consultation Request',
          message: `${appointment.user.name || 'A client'} has booked a consultation for ${scheduledAt.toLocaleDateString()}.`,
          type: 'booking',
        });
        
        // Instantly push to the lawyer's private socket room
        sendRealTimeNotification(lawyerUserId, savedNotification);
        
        // Broadcast dashboard update to lawyer
        io.to(`user:${lawyerUserId}`).emit("dashboard_update", { type: "new_booking_received", appointment });
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

// @desc    Update appointment status (Confirm/Reject)
// @route   PATCH /api/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, firebaseUid: true } },
        lawyer: { select: { userId: true, user: { select: { name: true } } } }
      }
    });

    // Notify the client about the status change
    try {
      if (appointment.user.id) {
        const title = status === 'CONFIRMED' ? 'Appointment Confirmed' : 'Appointment Rejected';
        const message = status === 'CONFIRMED' 
          ? `Your consultation with ${appointment.lawyer.user?.name || 'your lawyer'} has been confirmed.`
          : `Your consultation with ${appointment.lawyer.user?.name || 'your lawyer'} was rejected. Please book another time.`;

        const savedNotification = await createNotification({
          userId: appointment.user.id,
          title,
          message,
          type: 'booking',
        });
        
        sendRealTimeNotification(appointment.user.id, savedNotification);
        io.to(`user:${appointment.user.id}`).emit("dashboard_update", { type: "booking_updated", appointment });
      }
    } catch (notifErr) {
      console.error('Failed to create booking status notification:', notifErr);
    }

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};
