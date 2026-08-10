import { Request, Response, NextFunction } from 'express';
import {
  isCalComConfigured,
  getCalComBookings,
  getCalComEventTypes,
  cancelCalComBooking,
} from '../services/calComService';

/**
 * GET /api/cal-com/status
 * Returns whether the Cal.com API key is configured on this server.
 */
export const getStatus = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const configured = await isCalComConfigured();
    res.json({ configured });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cal-com/bookings
 * Proxies Cal.com bookings for the authenticated lawyer.
 *
 * Query params:
 *   startTime  - ISO 8601 start of range (defaults to start of current week)
 *   endTime    - ISO 8601 end of range   (defaults to 7 days from startTime)
 *   status     - 'upcoming' | 'past' | 'cancelled' (optional)
 */
export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startTime, endTime, status } = req.query as Record<string, string>;

    // Default to current week if not provided
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const afterStartTime = startTime || weekStart.toISOString();
    const beforeEndTime = endTime || weekEnd.toISOString();

    const data = await getCalComBookings({
      afterStartTime,
      beforeEndTime,
      status: (status as any) || 'upcoming',
    });

    // Normalize Cal.com booking shape → CalendarEvent shape used by frontend
    // Cal.com v2 booking object: { uid, title, start, end, attendees, status, ... }
    const events = (data?.data || data?.bookings || []).map((b: any) => ({
      id: b.uid || b.id,
      title: b.title || b.eventType?.title || 'Consultation',
      description: b.description || '',
      start: b.start,
      end: b.end,
      location: b.location || b.meetingUrl || '',
      colorId: '9',       // Blueberry — used for Cal.com imports
      htmlLink: b.metadata?.videoCallUrl || '',
      status: b.status,
      source: 'cal.com',  // Extra field so frontend can distinguish
    }));

    res.json({ events, total: events.length });
  } catch (err: any) {
    if (err.message?.includes('CAL_COM_API_KEY is not set')) {
      return res.status(503).json({ configured: false, events: [], message: 'Cal.com API key not configured' });
    }
    next(err);
  }
};

/**
 * GET /api/cal-com/event-types
 * Returns the Cal.com event types for this account.
 */
export const getEventTypes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getCalComEventTypes();
    res.json(data);
  } catch (err: any) {
    if (err.message?.includes('CAL_COM_API_KEY is not set')) {
      return res.status(503).json({ configured: false, eventTypes: [] });
    }
    next(err);
  }
};

/**
 * POST /api/cal-com/bookings/:uid/cancel
 * Cancels a Cal.com booking.
 */
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params;
    const { reason } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'Booking uid is required' });
    }

    const result = await cancelCalComBooking(uid, reason);
    res.json(result);
  } catch (err: any) {
    if (err.message?.includes('CAL_COM_API_KEY is not set')) {
      return res.status(503).json({ configured: false, message: 'Cal.com API key not configured' });
    }
    next(err);
  }
};
