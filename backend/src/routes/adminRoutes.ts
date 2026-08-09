import express from 'express';
import { getAdminStats, getPendingLawyers, verifyLawyer } from '../controllers/adminController';
import { getAllKnowledge, addKnowledge, removeKnowledge } from '../controllers/knowledgeController';
import { adminProtect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', getAdminStats); // Consider adding adminProtect here too if it isn't applied globally

// Lawyer Verification
router.get('/pending-lawyers', adminProtect, getPendingLawyers);
router.patch('/verify-lawyer/:id', adminProtect, verifyLawyer);

// Knowledge Base Management
router.get('/knowledge', adminProtect, getAllKnowledge);
router.post('/knowledge', adminProtect, addKnowledge);
router.delete('/knowledge/:id', adminProtect, removeKnowledge);

export default router;
