import express from 'express';
import { getLawyers, createLawyerProfile, updateLawyerProfile, getPendingLawyers, verifyLawyer, rejectLawyer, getLawyerById, getLawyerAnalytics, generateFinancialReport } from '../controllers/lawyerController';
import { protect, adminProtect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/report/download').get(protect, generateFinancialReport);
router.route('/').get(getLawyers).post(protect, createLawyerProfile);
router.route('/profile').put(protect, updateLawyerProfile);
router.route('/pending').get(getPendingLawyers);
router.route('/:id/verify').put(verifyLawyer);
router.route('/:id/reject').put(rejectLawyer);
router.route('/:id/analytics').get(protect, getLawyerAnalytics);
router.route('/:id').get(getLawyerById);

export default router;
