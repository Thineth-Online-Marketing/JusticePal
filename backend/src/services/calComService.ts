// Uses Node.js built-in global fetch (Node 18+). No external import needed.

const CAL_API_BASE = 'https://api.cal.com/v2';
const CAL_API_VERSION = '2024-08-13';

/**
 * Build headers using the provided key.
 * Falls back to the server-wide CAL_COM_API_KEY env var so local dev still works.
 */
function buildHeaders(apiKey?: string | null) {
  const key = apiKey || process.env.CAL_COM_API_KEY;
  if (!key) throw new Error('CAL_COM_API_KEY is not set');
  return {
    Authorization: `Bearer ${key}`,
    'cal-api-version': CAL_API_VERSION,
    'Content-Type': 'application/json',
  };
}

/** True if the given key (or the env fallback) is present */
export function isCalComConfigured(apiKey?: string | null): boolean {
  return !!(apiKey || process.env.CAL_COM_API_KEY);
}

/**
 * Fetch bookings from Cal.com within a date range.
 * Cal.com v2 query params: afterStartTime, beforeEndTime (ISO 8601)
 */
export async function getCalComBookings(
  params: {
    afterStartTime?: string;
    beforeEndTime?: string;
    status?: 'upcoming' | 'recurring' | 'past' | 'cancelled' | 'unconfirmed';
  },
  apiKey?: string | null,
) {
  const query = new URLSearchParams();
  if (params.afterStartTime) query.set('afterStartTime', params.afterStartTime);
  if (params.beforeEndTime) query.set('beforeEndTime', params.beforeEndTime);
  if (params.status) query.set('status', params.status);

  const res = await fetch(`${CAL_API_BASE}/bookings?${query.toString()}`, {
    headers: buildHeaders(apiKey),
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
export async function getCalComEventTypes(apiKey?: string | null) {
  const res = await fetch(`${CAL_API_BASE}/event-types`, {
    headers: buildHeaders(apiKey),
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
export async function cancelCalComBooking(
  bookingUid: string,
  reason?: string,
  apiKey?: string | null,
) {
  const res = await fetch(`${CAL_API_BASE}/bookings/${bookingUid}/cancel`, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: JSON.stringify({ reason: reason || 'Cancelled by lawyer' }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cal.com API error ${res.status}: ${text}`);
  }

  return res.json();
}
