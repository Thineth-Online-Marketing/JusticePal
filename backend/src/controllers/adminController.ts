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
      activeCases,
      revenueResult,
      recentBookings
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'client' }
      }),
      prisma.lawyer.count({
        where: { isVerified: true }
      }),
      prisma.lawyer.count({
        where: {
          isVerified: false
        }
      }),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: { status: 'confirmed' }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'succeeded' }
      }),
      prisma.appointment.findMany({
        take: 7,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          user: { select: { name: true } },
          lawyer: { select: { user: { select: { name: true } } } }
        }
      }),
      prisma.user.findMany({
        select: { createdAt: true }
      }),
      prisma.payment.findMany({
        where: { status: 'succeeded' },
        select: { amount: true, createdAt: true }
      })
    ]);

    // Compute chart data dynamically
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = new Date().getFullYear();
      if (m < 0) {
        m += 12;
        y -= 1;
      }
      last6Months.push({ month: months[m], monthIndex: m, year: y });
    }

    const allUsers = arguments[1] || []; // wait, Promise.all returns array
    const usersList = await prisma.user.findMany({ select: { createdAt: true } });
    const paymentsList = await prisma.payment.findMany({ where: { status: 'succeeded' }, select: { amount: true, createdAt: true } });

    const userGrowth = last6Months.map(m => {
      const count = usersList.filter(u => {
        const d = new Date(u.createdAt);
        return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
      }).length;
      return { month: m.month, users: count };
    });
    // For cumulative users (Growth):
    let runningTotal = usersList.filter(u => new Date(u.createdAt) < new Date(last6Months[0].year, last6Months[0].monthIndex, 1)).length;
    const userGrowthCumulative = userGrowth.map(m => {
      runningTotal += m.users;
      return { month: m.month, users: runningTotal };
    });

    const revenueTrends = last6Months.map(m => {
      const sum = paymentsList.filter(p => {
        const d = new Date(p.createdAt);
        return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
      }).reduce((acc, p) => acc + (p.amount || 0), 0);
      return { month: m.month, revenue: sum };
    });

    res.status(200).json({
      totalUsers,
      totalLawyers,
      pendingVerifications,
      totalAppointments,
      activeCases,
      totalRevenue: revenueResult._sum.amount || 0,
      recentBookings,
      userGrowth: userGrowthCumulative,
      revenueTrends
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

// @desc    Get all appointments for Admin Appointments page
// @route   GET /api/admin/appointments
// @access  Private (Admin only)
export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        lawyer: { select: { user: { select: { name: true, email: true } } } },
        payments: { select: { amount: true, status: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments for Admin Payments page
// @route   GET /api/admin/payments
// @access  Private (Admin only)
export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        appointment: {
          select: {
            scheduledAt: true,
            user: { select: { name: true, email: true } },
            lawyer: { select: { user: { select: { name: true } } } }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};
