import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get dashboard metrics for the Admin Panel
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalLawyers,
      pendingVerifications,
      totalAppointments,
      activeCases
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'user' }
      }),
      prisma.lawyer.count({
        where: { isVerified: true }
      }),
      prisma.lawyer.count({
        where: {
          isVerified: false,
          profileCompleted: true
        }
      }),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: { status: 'confirmed' }
      })
    ]);

    res.status(200).json({
      totalUsers,
      totalLawyers,
      pendingVerifications,
      totalAppointments,
      activeCases
    });
  } catch (error) {
    next(error);
  }
};
