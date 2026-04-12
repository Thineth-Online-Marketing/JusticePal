import express from 'express';
import { getProfile, updateProfile, deleteProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile)
  .delete(protect, deleteProfile);

export default router;
