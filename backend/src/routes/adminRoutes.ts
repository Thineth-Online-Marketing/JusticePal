import express from 'express';
import { getAdminStats, getPendingLawyers, verifyLawyer, getUsers, getAppointments, getPayments } from '../controllers/adminController';
import { getAllKnowledge, addKnowledge, removeKnowledge } from '../controllers/knowledgeController';
import { adminProtect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', adminProtect, getAdminStats);

// Lawyer Verification
router.get('/pending-lawyers', adminProtect, getPendingLawyers);
router.patch('/verify-lawyer/:id', adminProtect, verifyLawyer);
router.get('/users', adminProtect, getUsers);
router.get('/appointments', adminProtect, getAppointments);
router.get('/payments', adminProtect, getPayments);

// Knowledge Base Management
router.get('/knowledge', adminProtect, getAllKnowledge);
router.post('/knowledge', adminProtect, addKnowledge);
router.delete('/knowledge/:id', adminProtect, removeKnowledge);

export default router;
