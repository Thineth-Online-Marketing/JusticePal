import express from 'express';
import { getAdminStats } from '../controllers/adminController';
import { adminProtect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', getAdminStats);

export default router;
