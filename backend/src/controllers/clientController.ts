import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// @desc    Get client analytics
// @route   GET /api/clients/analytics
// @access  Private
export const getClientAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Total Consultations
    const totalConsultations = await prisma.appointment.count({
      where: { userId },
    });

    // Active Cases (confirmed or scheduled)
    const activeCases = await prisma.appointment.count({
      where: {
        userId,
        status: { in: ['confirmed', 'scheduled'] },
      },
    });

    // Total Spent (sum of successful payments)
    const payments = await prisma.payment.findMany({
      where: {
        appointment: { userId },
        status: 'succeeded',
      },
      select: { amount: true },
    });
    const totalSpent = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Upcoming Appointments (next 5)
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        userId,
        status: { in: ['confirmed', 'scheduled'] },
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
      include: {
        lawyer: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Total Docs
    const totalDocs = await prisma.caseFile.count({
      where: { userId },
    });

    // Active Cases (list of confirmed/scheduled appointments for the CaseCard)
    const activeCasesList = await prisma.appointment.findMany({
      where: {
        userId,
        status: { in: ['confirmed', 'scheduled'] },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 4,
      include: {
        lawyer: {
          include: {
            user: {
              select: { name: true, profilePicture: true },
            },
          },
        },
      },
    });

    res.status(200).json({
      totalConsultations,
      activeCases,
      totalSpent,
      totalDocs,
      upcomingAppointments,
      activeCasesList,
    });
  } catch (error) {
    next(error);
  }
};
