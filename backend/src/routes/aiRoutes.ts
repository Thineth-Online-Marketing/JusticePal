import { Router } from 'express';
import { chatWithAI, matchLawyers, draftDocument } from '../controllers/aiChatController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// POST /api/ai/chat — AI Legal Chatbot
router.post('/chat', protect, chatWithAI);

// POST /api/ai/match-lawyers — Smart Lawyer Matching
router.post('/match-lawyers', protect, matchLawyers);

// POST /api/ai/draft-document — AI Document Drafting
router.post('/draft-document', protect, draftDocument);

// POST /api/ai/guest-chat — Unauthenticated guest preview (stateless Pinecone query only)
router.post('/guest-chat', chatWithAI);

export default router;
