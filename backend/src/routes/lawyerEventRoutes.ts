import express from 'express';
import {
  getLawyerEvents,
  createLawyerEvent,
  updateLawyerEvent,
  deleteLawyerEvent,
} from '../controllers/lawyerEventController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getLawyerEvents)
  .post(protect, createLawyerEvent);

router.route('/:id')
  .patch(protect, updateLawyerEvent)
  .delete(protect, deleteLawyerEvent);

export default router;
