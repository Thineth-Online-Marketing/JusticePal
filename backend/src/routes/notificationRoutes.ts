import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController';

const router = express.Router();

// All routes are protected — user must be authenticated
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.patch('/read-all', protect, markAllAsRead);       // must come before /:id/read
router.patch('/:id/read', protect, markAsRead);

export default router;
