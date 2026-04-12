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
    });

    if (!user) {
      // Create user if they don't exist (initial sign-up context)
      user = await prisma.user.create({
        data: {
          firebaseUid: req.firebaseUid,
          name: name || req.firebaseUser?.name || 'Unknown User',
          email: email || req.firebaseUser?.email || '',
          role: role || 'user',
        },
      });
      res.status(201).json(user);
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    next(error);
  }
};
