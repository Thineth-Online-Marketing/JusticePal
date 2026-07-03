import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getOrCreateRoom,
  joinRoom,
  leaveRoom,
  getMessages,
  postMessage,
  generateSummary,
  getMyConsultations,
} from '../controllers/consultationController';

const router = Router();

// All consultation routes require authentication
router.use(protect);

// List all consultations for the current user
router.get('/my', getMyConsultations);

// Room management
router.get('/:appointmentId/room', getOrCreateRoom);
router.post('/:appointmentId/join', joinRoom);
router.post('/:appointmentId/leave', leaveRoom);

// Chat messages (REST fallback – primary channel is Socket.io)
router.get('/:appointmentId/messages', getMessages);
router.post('/:appointmentId/messages', postMessage);

// AI summary
router.post('/:appointmentId/summary', generateSummary);

export default router;
