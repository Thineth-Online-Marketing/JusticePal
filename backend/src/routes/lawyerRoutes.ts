import express from 'express';
import { getLawyers, createLawyerProfile } from '../controllers/lawyerController';

const router = express.Router();

router.route('/').get(getLawyers).post(createLawyerProfile);

export default router;
