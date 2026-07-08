import express from 'express';
import { getClientAnalytics } from '../controllers/clientController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/analytics', protect, getClientAnalytics);

export default router;
