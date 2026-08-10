import { google } from 'googleapis';
import prisma from '../lib/prisma';

/**
 * Creates and returns a configured OAuth2 client using environment credentials.
 */
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Generates the Google OAuth consent URL.
 * The lawyer's userId is passed as `state` so we can associate the tokens after callback.
 */
export function generateAuthUrl(userId: string): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    state: userId,
  });
}

/**
 * Exchanges an authorization code for access & refresh tokens.
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Persists (upserts) the OAuth2 tokens for a user in the database.
 */
export async function saveTokens(
  userId: string,
  tokens: { access_token?: string | null; refresh_token?: string | null; expiry_date?: number | null }
) {
  const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000);

  await prisma.googleCalendarToken.upsert({
    where: { userId },
    update: {
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token || undefined,
      expiresAt,
    },
    create: {
      userId,
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token || '',
      expiresAt,
    },
  });
}

/**
 * Returns an authenticated Google Calendar client for the given user.
 * Automatically refreshes expired access tokens.
 */
export async function getCalendarClient(userId: string) {
  const tokenRecord = await prisma.googleCalendarToken.findUnique({ where: { userId } });

  if (!tokenRecord) {
    throw new Error('Google Calendar is not connected. Please connect your account first.');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokenRecord.accessToken,
    refresh_token: tokenRecord.refreshToken,
    expiry_date: tokenRecord.expiresAt.getTime(),
  });

  // Auto-refresh if expired
  if (tokenRecord.expiresAt.getTime() < Date.now()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    // Persist refreshed tokens
    await prisma.googleCalendarToken.update({
      where: { userId },
      data: {
        accessToken: credentials.access_token || tokenRecord.accessToken,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : tokenRecord.expiresAt,
      },
    });
  }

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Lists events from the user's Google Calendar.
 */
export async function listEvents(userId: string, timeMin: string, timeMax: string) {
  const calendar = await getCalendarClient(userId);
  const tokenRecord = await prisma.googleCalendarToken.findUnique({ where: { userId } });

  const response = await calendar.events.list({
    calendarId: tokenRecord?.calendarId || 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 100,
  });

  return (response.data.items || []).map((event) => ({
    id: event.id,
    title: event.summary || 'Untitled',
    description: event.description || '',
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    location: event.location || '',
    colorId: event.colorId || '',
    htmlLink: event.htmlLink || '',
    status: event.status || '',
  }));
}

/**
 * Creates a new event on the user's Google Calendar.
 */
export async function createEvent(
  userId: string,
  eventData: { title: string; description?: string; start: string; end: string; location?: string; colorId?: string }
) {
  const calendar = await getCalendarClient(userId);
  const tokenRecord = await prisma.googleCalendarToken.findUnique({ where: { userId } });

  const response = await calendar.events.insert({
    calendarId: tokenRecord?.calendarId || 'primary',
    requestBody: {
      summary: eventData.title,
      description: eventData.description || '',
      location: eventData.location || '',
      colorId: eventData.colorId || undefined,
      start: {
        dateTime: eventData.start,
        timeZone: 'Asia/Colombo',
      },
      end: {
        dateTime: eventData.end,
        timeZone: 'Asia/Colombo',
      },
    },
  });

  return {
    id: response.data.id,
    title: response.data.summary,
    start: response.data.start?.dateTime || response.data.start?.date,
    end: response.data.end?.dateTime || response.data.end?.date,
    htmlLink: response.data.htmlLink,
  };
}

/**
 * Updates an existing event on the user's Google Calendar.
 */
export async function updateEvent(
  userId: string,
  eventId: string,
  eventData: { title?: string; description?: string; start?: string; end?: string; location?: string; colorId?: string }
) {
  const calendar = await getCalendarClient(userId);
  const tokenRecord = await prisma.googleCalendarToken.findUnique({ where: { userId } });

  const requestBody: any = {};
  if (eventData.title !== undefined) requestBody.summary = eventData.title;
  if (eventData.description !== undefined) requestBody.description = eventData.description;
  if (eventData.location !== undefined) requestBody.location = eventData.location;
  if (eventData.colorId !== undefined) requestBody.colorId = eventData.colorId;
  if (eventData.start) {
    requestBody.start = { dateTime: eventData.start, timeZone: 'Asia/Colombo' };
  }
  if (eventData.end) {
    requestBody.end = { dateTime: eventData.end, timeZone: 'Asia/Colombo' };
  }

  const response = await calendar.events.patch({
    calendarId: tokenRecord?.calendarId || 'primary',
    eventId,
    requestBody,
  });

  return {
    id: response.data.id,
    title: response.data.summary,
    start: response.data.start?.dateTime || response.data.start?.date,
    end: response.data.end?.dateTime || response.data.end?.date,
  };
}

/**
 * Deletes an event from the user's Google Calendar.
 */
export async function deleteEvent(userId: string, eventId: string) {
  const calendar = await getCalendarClient(userId);
  const tokenRecord = await prisma.googleCalendarToken.findUnique({ where: { userId } });

  await calendar.events.delete({
    calendarId: tokenRecord?.calendarId || 'primary',
    eventId,
  });
}

/**
 * Removes stored tokens, effectively disconnecting the Google Calendar.
 */
export async function disconnectCalendar(userId: string) {
  await prisma.googleCalendarToken.delete({ where: { userId } }).catch(() => {
    // Token may not exist, ignore error
  });
}

/**
 * Checks if a user has connected their Google Calendar.
 */
export async function isCalendarConnected(userId: string): Promise<boolean> {
  const tokenRecord = await prisma.googleCalendarToken.findUnique({ where: { userId } });
  return !!tokenRecord;
}
