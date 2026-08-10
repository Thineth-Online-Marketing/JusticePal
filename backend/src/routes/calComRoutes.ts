import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getStatus, getBookings, getEventTypes, cancelBooking } from '../controllers/calComController';

const router = express.Router();

// Public status check — frontend uses this to decide what to show
router.get('/status', protect, getStatus);

// Bookings
router.get('/bookings', protect, getBookings);
router.post('/bookings/:uid/cancel', protect, cancelBooking);

// Event types
router.get('/event-types', protect, getEventTypes);

export default router;
