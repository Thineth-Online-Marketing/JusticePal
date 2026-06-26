import { Router } from 'express';
import { chatWithAI, matchLawyers } from '../controllers/aiChatController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// POST /api/ai/chat — AI Legal Chatbot
router.post('/chat', protect, chatWithAI);

// POST /api/ai/match-lawyers — Smart Lawyer Matching
router.post('/match-lawyers', protect, matchLawyers);

export default router;
