import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import prisma from '../lib/prisma';

/**
 * Lightweight middleware that tracks user sessions.
 * 
 * Run this AFTER the `protect` middleware. On each authenticated request:
 *   - If an `x-session-id` header is present, update that session's lastActiveAt
 *   - If not, create a new Session record and return its ID in the `x-session-id` response header
 * 
 * The frontend should persist the session ID (localStorage) and send it
 * on subsequent requests so we don't create a new session every time.
 */
export const trackSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return next();

    const existingSessionId = req.headers['x-session-id'] as string | undefined;

    // Parse device info from User-Agent (basic heuristic)
    const ua = req.headers['user-agent'] || 'Unknown';
    const deviceName = parseDeviceName(ua);

    if (existingSessionId) {
      // Update last-active timestamp for the existing session
      await prisma.session.updateMany({
        where: { id: existingSessionId, userId: req.user.id },
        data: { lastActiveAt: new Date() },
      });
    } else {
      // Create a new session record
      const session = await prisma.session.create({
        data: {
          userId: req.user.id,
          deviceName,
          location: 'Unknown', // Could be enriched with IP geolocation in production
        },
      });

      // Return the session ID so the frontend can persist it
      res.setHeader('x-session-id', session.id);
    }

    next();
  } catch (error) {
    // Don't block the request if session tracking fails
    console.error('[SessionTracker] Error:', error);
    next();
  }
};

/**
 * Parse a simplified device name from the User-Agent string.
 */
function parseDeviceName(ua: string): string {
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android Device';
  if (/Macintosh|Mac OS/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Linux/i.test(ua)) return 'Linux PC';
  if (/CrOS/i.test(ua)) return 'Chromebook';
  return 'Unknown Device';
}
