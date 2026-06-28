import express from 'express';
import { getAdminStats } from '../controllers/adminController';
import { getAllKnowledge, addKnowledge, removeKnowledge } from '../controllers/knowledgeController';
import { adminProtect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', getAdminStats);

// Knowledge Base Management
router.get('/knowledge', getAllKnowledge);
router.post('/knowledge', addKnowledge);
router.delete('/knowledge/:id', removeKnowledge);

export default router;
