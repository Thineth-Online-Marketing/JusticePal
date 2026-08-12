import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getStatus,
  getBookings,
  getEventTypes,
  cancelBooking,
  saveKey,
  deleteKey,
} from '../controllers/calComController';

const router = express.Router();

// Status — does this lawyer have Cal.com configured?
router.get('/status', protect, getStatus);

// Per-lawyer API key management
router.patch('/key', protect, saveKey);
router.delete('/key', protect, deleteKey);

// Bookings (use this lawyer's key)
router.get('/bookings', protect, getBookings);
router.post('/bookings/:uid/cancel', protect, cancelBooking);

// Event types
router.get('/event-types', protect, getEventTypes);

export default router;
