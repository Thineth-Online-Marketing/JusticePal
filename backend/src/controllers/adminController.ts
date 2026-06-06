import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get dashboard metrics for the Admin Panel
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: 'user' }
    });

    const totalLawyers = await prisma.lawyer.count({
      where: { isVerified: true }
    });

    const pendingVerifications = await prisma.lawyer.count({
      where: {
        isVerified: false,
        profileCompleted: true
      }
    });

    const totalAppointments = await prisma.appointment.count();

    const activeCases = await prisma.appointment.count({
      where: { status: 'confirmed' }
    });

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
