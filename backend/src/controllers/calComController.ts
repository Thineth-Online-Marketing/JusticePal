import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  isCalComConfigured,
  getCalComBookings,
  getCalComEventTypes,
  cancelCalComBooking,
} from '../services/calComService';

const prisma = new PrismaClient();

/**
 * Helper: look up the Cal.com API key for the authenticated lawyer.
 * Falls back to the server-wide env var (useful in local dev).
 */
async function getLawyerCalKey(req: Request): Promise<string | null> {
  const userId = (req as any).user?.id;
  if (!userId) return process.env.CAL_COM_API_KEY || null;

  const lawyer = await prisma.lawyer.findUnique({
    where: { userId },
    select: { calComApiKey: true },
  });

  return lawyer?.calComApiKey || process.env.CAL_COM_API_KEY || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cal-com/status
// Returns whether this lawyer has a Cal.com API key configured.
// ─────────────────────────────────────────────────────────────────────────────
export const getStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = await getLawyerCalKey(req);
    res.json({ configured: isCalComConfigured(apiKey) });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/cal-com/key
// Saves or updates this lawyer's Cal.com API key.
// Body: { apiKey: string }
// ─────────────────────────────────────────────────────────────────────────────
export const saveKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { apiKey } = req.body as { apiKey?: string };
    if (!apiKey || !apiKey.startsWith('cal_')) {
      return res.status(400).json({ error: 'Invalid Cal.com API key. It should start with cal_live_ or cal_test_.' });
    }

    // Verify the key works before saving
    try {
      const CAL_API_BASE = 'https://api.cal.com/v2';
      const verifyRes = await fetch(`${CAL_API_BASE}/me`, {
        headers: { Authorization: `Bearer ${apiKey}`, 'cal-api-version': '2024-08-13' },
      });
      if (!verifyRes.ok) {
        return res.status(400).json({ error: 'Could not verify this API key with Cal.com. Please check it is correct.' });
      }
    } catch {
      return res.status(400).json({ error: 'Could not reach Cal.com to verify the key.' });
    }

    const lawyer = await prisma.lawyer.findUnique({ where: { userId } });
    if (!lawyer) return res.status(404).json({ error: 'Lawyer profile not found' });

    await prisma.lawyer.update({
      where: { userId },
      data: { calComApiKey: apiKey },
    });

    res.json({ configured: true, message: 'Cal.com API key saved successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/cal-com/key
// Removes this lawyer's Cal.com API key.
// ─────────────────────────────────────────────────────────────────────────────
export const deleteKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    await prisma.lawyer.updateMany({
      where: { userId },
      data: { calComApiKey: null },
    });

    res.json({ configured: false, message: 'Cal.com API key removed.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cal-com/bookings
// ─────────────────────────────────────────────────────────────────────────────
export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = await getLawyerCalKey(req);
    if (!isCalComConfigured(apiKey)) {
      return res.status(503).json({ configured: false, events: [], message: 'Cal.com API key not configured' });
    }

    const { startTime, endTime, status } = req.query as Record<string, string>;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const afterStartTime = startTime || weekStart.toISOString();
    const beforeEndTime  = endTime   || weekEnd.toISOString();

    const data = await getCalComBookings(
      { afterStartTime, beforeEndTime, status: (status as any) || 'upcoming' },
      apiKey,
    );

    const events = (data?.data || data?.bookings || []).map((b: any) => ({
      id: b.uid || b.id,
      title: b.title || b.eventType?.title || 'Consultation',
      description: b.description || '',
      start: b.start,
      end: b.end,
      location: b.location || b.meetingUrl || '',
      colorId: '9',
      htmlLink: b.metadata?.videoCallUrl || '',
      status: b.status,
      source: 'cal.com',
    }));

    res.json({ events, total: events.length });
  } catch (err: any) {
    if (err.message?.includes('CAL_COM_API_KEY is not set')) {
      return res.status(503).json({ configured: false, events: [], message: 'Cal.com API key not configured' });
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cal-com/event-types
// ─────────────────────────────────────────────────────────────────────────────
export const getEventTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = await getLawyerCalKey(req);
    const data = await getCalComEventTypes(apiKey);
    res.json(data);
  } catch (err: any) {
    if (err.message?.includes('CAL_COM_API_KEY is not set')) {
      return res.status(503).json({ configured: false, eventTypes: [] });
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/cal-com/bookings/:uid/cancel
// ─────────────────────────────────────────────────────────────────────────────
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params;
    const { reason } = req.body;
    if (!uid) return res.status(400).json({ error: 'Booking uid is required' });

    const apiKey = await getLawyerCalKey(req);
    const result = await cancelCalComBooking(uid, reason, apiKey);
    res.json(result);
  } catch (err: any) {
    if (err.message?.includes('CAL_COM_API_KEY is not set')) {
      return res.status(503).json({ configured: false, message: 'Cal.com API key not configured' });
    }
    next(err);
  }
};
