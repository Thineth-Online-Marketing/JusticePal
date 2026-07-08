import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { Response, NextFunction } from 'express';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get client profile by userId
// @route   GET /api/profile/:userId
// @access  Private
router.get('/:userId', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Only allow users to fetch their own profile
    if (req.user.id !== userId) {
      res.status(403);
      throw new Error('Not authorized to view this profile');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        preferredLanguage: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @desc    Update client profile
// @route   PUT /api/profile/:userId
// @access  Private
router.put('/:userId', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Only allow users to update their own profile
    if (req.user.id !== userId) {
      res.status(403);
      throw new Error('Not authorized to update this profile');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { name, phone, location, preferredLanguage } = req.body;

    // Validate required fields
    if (name !== undefined && name.trim() === '') {
      res.status(400);
      throw new Error('Name cannot be empty');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() || null }),
        ...(location !== undefined && { location: location.trim() || null }),
        ...(preferredLanguage !== undefined && { preferredLanguage }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        preferredLanguage: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
