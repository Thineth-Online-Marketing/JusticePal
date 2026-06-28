import express from 'express';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  getConnectionStatus,
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  disconnectGoogleCalendar,
} from '../controllers/googleCalendarController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// OAuth flow
router.get('/auth', protect, initiateGoogleAuth);
router.get('/callback', handleGoogleCallback); // Public — Google redirects here

// Connection status
router.get('/status', protect, getConnectionStatus);

// Event CRUD
router.get('/events', protect, getCalendarEvents);
router.post('/events', protect, createCalendarEvent);
router.put('/events/:id', protect, updateCalendarEvent);
router.delete('/events/:id', protect, deleteCalendarEvent);

// Disconnect
router.delete('/disconnect', protect, disconnectGoogleCalendar);

export default router;
