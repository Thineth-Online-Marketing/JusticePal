import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../lib/prisma';
import admin from '../config/firebase';

// @desc    Change user password via Firebase Admin SDK
// @route   PUT /api/account/password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string') {
      res.status(400);
      throw new Error('New password is required');
    }

    if (newPassword.length < 8) {
      res.status(400);
      throw new Error('Password must be at least 8 characters long');
    }

    // Update password via Firebase Admin SDK
    // Note: Firebase handles password hashing internally
    await admin.auth().updateUser(req.firebaseUid!, {
      password: newPassword,
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    // Handle Firebase-specific errors
    if (error.code === 'auth/weak-password') {
      res.status(400);
      return next(new Error('Password is too weak. Please choose a stronger password.'));
    }
    if (error.code === 'auth/user-not-found') {
      res.status(404);
      return next(new Error('User not found in authentication system.'));
    }
    next(error);
  }
};

// @desc    Toggle two-factor authentication
// @route   PATCH /api/account/2fa
// @access  Private
export const toggle2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      res.status(400);
      throw new Error('Field "enabled" must be a boolean');
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorEnabled: enabled },
      select: { id: true, twoFactorEnabled: true },
    });

    res.json({
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 2FA status for current user
// @route   GET /api/account/2fa
// @access  Private
export const get2FAStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { twoFactorEnabled: true },
    });

    res.json({ twoFactorEnabled: user?.twoFactorEnabled ?? false });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active sessions for the logged-in user
// @route   GET /api/account/sessions
// @access  Private
export const getSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user.id },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        deviceName: true,
        location: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    // Mark the current session (if we know it)
    const currentSessionId = req.headers['x-session-id'] as string | undefined;
    const sessionsWithCurrent = sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));

    res.json(sessionsWithCurrent);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific session (log out a device)
// @route   DELETE /api/account/sessions/:sessionId
// @access  Private
export const deleteSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    // Only allow deleting sessions that belong to the logged-in user
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }

    if (session.userId !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to delete this session');
    }

    await prisma.session.delete({ where: { id: sessionId } });

    res.json({ message: 'Session terminated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all sessions for the user except the current one
// @route   DELETE /api/account/sessions
// @access  Private
export const deleteAllSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentSessionId = req.headers['x-session-id'] as string | undefined;

    const deleteFilter: any = { userId: req.user.id };

    // Keep the current session if we know which one it is
    if (currentSessionId) {
      deleteFilter.id = { not: currentSessionId };
    }

    const result = await prisma.session.deleteMany({
      where: deleteFilter,
    });

    res.json({
      message: `Logged out of ${result.count} device(s)`,
      deletedCount: result.count,
    });
  } catch (error) {
    next(error);
  }
};
