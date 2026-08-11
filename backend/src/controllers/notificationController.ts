import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// ─── Helper: create a notification (used by other controllers too) ───
export const createNotification = async ({
  userId,
  title,
  message,
  type = 'info',
}: {
  userId: string;
  title: string;
  message: string;
  type?: string;
}) => {
  return prisma.notification.create({
    data: { userId, title, message, type },
  });
};

// @desc    Get notifications for the authenticated user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401);
      throw new Error('Not authenticated');
    }

    const unreadOnly = req.query.unreadOnly === 'true';

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401);
      throw new Error('Not authenticated');
    }

    const count = await prisma.notification.count({
      where: { userId, read: false },
    });

    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401);
      throw new Error('Not authenticated');
    }

    // Verify the notification belongs to this user
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      res.status(404);
      throw new Error('Notification not found');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read for the authenticated user
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401);
      throw new Error('Not authenticated');
    }

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
