import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { trackSession } from '../middleware/sessionTracker';
import {
  changePassword,
  toggle2FA,
  get2FAStatus,
  getSessions,
  deleteSession,
  deleteAllSessions,
} from '../controllers/accountController';

const router = express.Router();

// All routes require authentication
// Password
router.put('/password', protect, changePassword);

// Two-Factor Authentication
router.get('/2fa', protect, get2FAStatus);
router.patch('/2fa', protect, toggle2FA);

// Sessions (track session on read, so we auto-create if needed)
router.get('/sessions', protect, trackSession, getSessions);
router.delete('/sessions/:sessionId', protect, deleteSession);
router.delete('/sessions', protect, deleteAllSessions);

export default router;
