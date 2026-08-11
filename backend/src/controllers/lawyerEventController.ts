import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc  List lawyer events within a time window
// @route GET /api/lawyer-events?startTime=&endTime=
// @access Private (lawyer)
export const getLawyerEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) { res.status(401); throw new Error('Not authorized'); }

    const { startTime, endTime } = req.query;

    const where: any = { userId: req.user.id };
    if (startTime || endTime) {
      where.start = {};
      if (startTime) where.start.gte = new Date(startTime as string);
      if (endTime)   where.start.lte = new Date(endTime as string);
    }

    const events = await prisma.lawyerEvent.findMany({
      where,
      orderBy: { start: 'asc' },
    });

    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// @desc  Create a lawyer event
// @route POST /api/lawyer-events
// @access Private (lawyer)
export const createLawyerEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) { res.status(401); throw new Error('Not authorized'); }

    const { title, description, start, end, location, colorId } = req.body;

    if (!title || !start || !end) {
      res.status(400);
      throw new Error('title, start, and end are required');
    }

    const event = await prisma.lawyerEvent.create({
      data: {
        userId: req.user.id,
        title,
        description: description || '',
        start: new Date(start),
        end: new Date(end),
        location: location || '',
        colorId: colorId || '6',
      },
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// @desc  Update a lawyer event
// @route PATCH /api/lawyer-events/:id
// @access Private (lawyer — must own the event)
export const updateLawyerEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) { res.status(401); throw new Error('Not authorized'); }

    const { id } = req.params;

    // Ensure the event belongs to this user
    const existing = await prisma.lawyerEvent.findUnique({ where: { id } });
    if (!existing) { res.status(404); throw new Error('Event not found'); }
    if (existing.userId !== req.user.id) { res.status(403); throw new Error('Forbidden'); }

    const { title, description, start, end, location, colorId } = req.body;

    const event = await prisma.lawyerEvent.update({
      where: { id },
      data: {
        ...(title       !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(start       !== undefined && { start: new Date(start) }),
        ...(end         !== undefined && { end: new Date(end) }),
        ...(location    !== undefined && { location }),
        ...(colorId     !== undefined && { colorId }),
      },
    });

    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a lawyer event
// @route DELETE /api/lawyer-events/:id
// @access Private (lawyer — must own the event)
export const deleteLawyerEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) { res.status(401); throw new Error('Not authorized'); }

    const { id } = req.params;

    const existing = await prisma.lawyerEvent.findUnique({ where: { id } });
    if (!existing) { res.status(404); throw new Error('Event not found'); }
    if (existing.userId !== req.user.id) { res.status(403); throw new Error('Forbidden'); }

    await prisma.lawyerEvent.delete({ where: { id } });

    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};
