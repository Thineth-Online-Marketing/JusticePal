import express from 'express';
import { getLawyers, createLawyerProfile, updateLawyerProfile } from '../controllers/lawyerController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getLawyers).post(protect, createLawyerProfile);
router.route('/profile').put(protect, updateLawyerProfile);

export default router;
