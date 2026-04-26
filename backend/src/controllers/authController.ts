import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Sync Firebase authenticated user to PostgreSQL database
// @route   POST /api/auth/sync
// @access  Private (Needs valid Firebase token)
export const syncUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, name, role } = req.body;
    
    // `req.firebaseUid` comes from `verifyFirebaseToken` middleware
    if (!req.firebaseUid) {
      res.status(400);
      throw new Error('Firebase UID missing');
    }

    // Check if user exists in PG DB
    let user = await prisma.user.findUnique({
      where: { firebaseUid: req.firebaseUid },
      include: { lawyerProfile: true },
    });

    if (!user) {
      // Create user if they don't exist (initial sign-up context)
      const isLawyer = role === 'lawyer';
      
      user = await prisma.user.create({
        data: {
          firebaseUid: req.firebaseUid,
          name: name || req.firebaseUser?.name || 'Unknown User',
          email: email || req.firebaseUser?.email || '',
          role: role || 'user',
          lawyerProfile: isLawyer ? {
            create: {} // Creates an empty Lawyer record associated with this User
          } : undefined,
        },
        include: { lawyerProfile: true },
      });
      res.status(201).json(user);
    } else {
      // If user exists and is a lawyer but doesn't have a profile yet (legacy check)
      if (user.role === 'lawyer' && !user.lawyerProfile) {
        await prisma.lawyer.create({
          data: { userId: user.id }
        });
        user = await prisma.user.findUnique({
          where: { id: user.id },
          include: { lawyerProfile: true },
        }) as any;
      }
      res.status(200).json(user);
    }
  } catch (error) {
    next(error);
  }
};
