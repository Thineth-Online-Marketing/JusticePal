import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as gcalService from '../services/googleCalendarService';

/**
 * GET /api/google-calendar/auth
 * Generates the Google OAuth consent URL and returns it.
 * The frontend opens this URL to let the lawyer pick their Google account.
 */
export const initiateGoogleAuth = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const authUrl = gcalService.generateAuthUrl(req.user.id);
    res.json({ authUrl });
  } catch (error: any) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate Google auth URL' });
  }
};

/**
 * GET /api/google-calendar/callback
 * Google redirects here after the lawyer authorizes.
 * Exchanges the code for tokens, saves them, then redirects to the frontend calendar.
 */
export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    const tokens = await gcalService.getTokensFromCode(code as string);
    await gcalService.saveTokens(userId as string, tokens);

    // Redirect back to the lawyer calendar page with success indicator
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/lawyer-dashboard/calendar?connected=true`);
  } catch (error: any) {
    console.error('Error handling Google callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/lawyer-dashboard/calendar?error=auth_failed`);
  }
};

/**
 * GET /api/google-calendar/status
 * Returns whether the lawyer has connected their Google Calendar.
 */
export const getConnectionStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const connected = await gcalService.isCalendarConnected(req.user.id);
    res.json({ connected });
  } catch (error: any) {
    console.error('Error checking connection status:', error);
    res.status(500).json({ error: 'Failed to check connection status' });
  }
};

/**
 * GET /api/google-calendar/events
 * Returns events within a given date range.
 * Query params: timeMin, timeMax (ISO 8601 strings)
 */
export const getCalendarEvents = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { timeMin, timeMax } = req.query;

    if (!timeMin || !timeMax) {
      return res.status(400).json({ error: 'timeMin and timeMax query parameters are required' });
    }

    const events = await gcalService.listEvents(req.user.id, timeMin as string, timeMax as string);
    res.json({ events });
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    if (error.message?.includes('not connected')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

/**
 * POST /api/google-calendar/events
 * Creates a new event on the lawyer's Google Calendar.
 * Body: { title, description?, start, end, location?, colorId? }
 */
export const createCalendarEvent = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { title, description, start, end, location, colorId } = req.body;

    if (!title || !start || !end) {
      return res.status(400).json({ error: 'title, start, and end are required' });
    }

    const event = await gcalService.createEvent(req.user.id, {
      title,
      description,
      start,
      end,
      location,
      colorId,
    });

    res.status(201).json({ event });
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
};

/**
 * PUT /api/google-calendar/events/:id
 * Updates an existing event on the lawyer's Google Calendar.
 */
export const updateCalendarEvent = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const { title, description, start, end, location, colorId } = req.body;

    const event = await gcalService.updateEvent(req.user.id, id, {
      title,
      description,
      start,
      end,
      location,
      colorId,
    });

    res.json({ event });
  } catch (error: any) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
};

/**
 * DELETE /api/google-calendar/events/:id
 * Deletes an event from the lawyer's Google Calendar.
 */
export const deleteCalendarEvent = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    await gcalService.deleteEvent(req.user.id, id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
};

/**
 * DELETE /api/google-calendar/disconnect
 * Disconnects the lawyer's Google Calendar by removing stored tokens.
 */
export const disconnectGoogleCalendar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await gcalService.disconnectCalendar(req.user.id);
    res.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error: any) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ error: 'Failed to disconnect Google Calendar' });
  }
};
