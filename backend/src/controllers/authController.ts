import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../lib/prisma';
import { sendWelcomeEmail, sendLawyerWelcomeEmail } from '../services/emailService';

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

    const resolvedEmail = email || req.firebaseUser?.email || '';
    const isAdmin = resolvedEmail === 'admin@justicepal.com' || resolvedEmail?.endsWith('@justicepal.admin');
    const inputRole = (role || 'user').toLowerCase();
    const resolvedRole = isAdmin ? 'admin' : inputRole;

    if (!user) {
      // Create user if they don't exist (initial sign-up context)
      const isLawyer = resolvedRole === 'lawyer';
      
      user = await prisma.user.create({
        data: {
          firebaseUid: req.firebaseUid,
          name: name || req.firebaseUser?.name || 'Unknown User',
          email: resolvedEmail,
          role: resolvedRole,
          lawyerProfile: isLawyer ? {
            create: {} // Creates an empty Lawyer record associated with this User
          } : undefined,
        },
        include: { lawyerProfile: true },
      });

      // ── Send welcome email (fire-and-forget, don't block response) ──
      const userName = user.name || 'User';
      if (resolvedEmail) {
        if (isLawyer) {
          sendLawyerWelcomeEmail({ toEmail: resolvedEmail, name: userName }).catch(() => {});
        } else if (resolvedRole === 'client' || resolvedRole === 'user') {
          sendWelcomeEmail({ toEmail: resolvedEmail, name: userName }).catch(() => {});
        }
      }

      res.status(201).json(user);
    } else {
      // If user exists but role changed (e.g. upgraded to admin via email pattern)
      if (user.role !== resolvedRole) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: resolvedRole },
          include: { lawyerProfile: true },
        });
      }
      
      // If user exists and is a lawyer but doesn't have a profile yet (legacy check)
      if (user.role.toLowerCase() === 'lawyer' && !user.lawyerProfile) {
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
