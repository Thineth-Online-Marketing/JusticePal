import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

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

// @desc    Get all pending (unverified) lawyers
// @route   GET /api/admin/pending-lawyers
// @access  Private (Admin only)
export const getPendingLawyers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Find any users with role lawyer but no profile, and create the profile
    const usersWithoutProfile = await prisma.user.findMany({
      where: {
        role: { in: ['lawyer', 'LAWYER'] },
        lawyerProfile: null
      }
    });

    for (const u of usersWithoutProfile) {
      await prisma.lawyer.create({
        data: { userId: u.id }
      });
    }

    // 2. Fetch pending lawyers normally
    const pendingLawyers = await prisma.lawyer.findMany({
      where: {
        isVerified: false
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.status(200).json(pendingLawyers);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or reject a lawyer
// @route   PATCH /api/admin/verify-lawyer/:id
// @access  Private (Admin only)
export const verifyLawyer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const updatedLawyer = await prisma.lawyer.update({
      where: { id },
      data: { isVerified }
    });

    res.status(200).json({
      success: true,
      lawyer: updatedLawyer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for User Management
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;

    const whereClause: any = {};
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lawyerProfile: {
          select: {
            isVerified: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
