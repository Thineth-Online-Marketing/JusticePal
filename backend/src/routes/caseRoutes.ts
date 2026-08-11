import express from 'express';
import { getCases } from '../controllers/caseController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getCases);

export default router;
