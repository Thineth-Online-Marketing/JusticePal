import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
} from '../controllers/inboxController';

const router = Router();

// All inbox routes require authentication
router.use(protect);

// List conversations for the authenticated user
router.get('/conversations', getConversations);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Create a new conversation
router.post('/conversations', createConversation);

// Send a message
router.post('/send', sendMessage);

export default router;
