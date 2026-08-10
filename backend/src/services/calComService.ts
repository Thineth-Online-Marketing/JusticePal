// Uses Node.js built-in global fetch (Node 18+). No external import needed.

const CAL_API_BASE = 'https://api.cal.com/v2';
const CAL_API_VERSION = '2024-08-13';

function getHeaders() {
  const key = process.env.CAL_COM_API_KEY;
  if (!key) throw new Error('CAL_COM_API_KEY is not set in environment variables');
  return {
    Authorization: `Bearer ${key}`,
    'cal-api-version': CAL_API_VERSION,
    'Content-Type': 'application/json',
  };
}

export async function isCalComConfigured(): Promise<boolean> {
  return !!process.env.CAL_COM_API_KEY;
}

/**
 * Fetch bookings from Cal.com within a date range.
 * Cal.com v2 query params: afterStartTime, beforeEndTime (ISO 8601)
 */
export async function getCalComBookings(params: {
  afterStartTime?: string;
  beforeEndTime?: string;
  status?: 'upcoming' | 'recurring' | 'past' | 'cancelled' | 'unconfirmed';
}) {
  const query = new URLSearchParams();
  if (params.afterStartTime) query.set('afterStartTime', params.afterStartTime);
  if (params.beforeEndTime) query.set('beforeEndTime', params.beforeEndTime);
  if (params.status) query.set('status', params.status);

  const res = await fetch(`${CAL_API_BASE}/bookings?${query.toString()}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cal.com API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Fetch event types from Cal.com.
 */
export async function getCalComEventTypes() {
  const res = await fetch(`${CAL_API_BASE}/event-types`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cal.com API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Cancel a Cal.com booking.
 */
export async function cancelCalComBooking(bookingUid: string, reason?: string) {
  const res = await fetch(`${CAL_API_BASE}/bookings/${bookingUid}/cancel`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason: reason || 'Cancelled by lawyer' }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cal.com API error ${res.status}: ${text}`);
  }

  return res.json();
}
