import express from 'express';
import { getAdminStats, getPendingLawyers, verifyLawyer, getUsers, getAppointments, getPayments } from '../controllers/adminController';
import { getAllKnowledge, addKnowledge, removeKnowledge } from '../controllers/knowledgeController';

const router = express.Router();

router.get('/stats', getAdminStats);

// Lawyer Verification
router.get('/pending-lawyers', getPendingLawyers);
router.patch('/verify-lawyer/:id', verifyLawyer);
router.get('/users', getUsers);
router.get('/appointments', getAppointments);
router.get('/payments', getPayments);

// Knowledge Base Management
router.get('/knowledge', getAllKnowledge);
router.post('/knowledge', addKnowledge);
router.delete('/knowledge/:id', removeKnowledge);

export default router;
