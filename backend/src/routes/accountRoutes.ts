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
  getAccountSettings,
  updateProfile,
  updatePreferences,
  deactivateAccount,
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

// Settings & Profile
router.get('/settings', protect, getAccountSettings);
router.put('/profile', protect, updateProfile);
router.patch('/preferences', protect, updatePreferences);
router.post('/deactivate', protect, deactivateAccount);

export default router;
