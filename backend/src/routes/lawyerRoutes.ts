import express from 'express';
import { getLawyers, createLawyerProfile, updateLawyerProfile, getPendingLawyers, verifyLawyer, rejectLawyer, getLawyerById } from '../controllers/lawyerController';
import { protect, adminProtect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getLawyers).post(protect, createLawyerProfile);
router.route('/profile').put(protect, updateLawyerProfile);
router.route('/pending').get(adminProtect, getPendingLawyers);
router.route('/:id/verify').put(adminProtect, verifyLawyer);
router.route('/:id/reject').put(adminProtect, rejectLawyer);
router.route('/:id').get(getLawyerById);

export default router;
