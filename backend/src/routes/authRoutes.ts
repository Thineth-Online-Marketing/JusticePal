import express from 'express';
import { syncUser } from '../controllers/authController';
import { verifyFirebaseToken } from '../middleware/authMiddleware';

const router = express.Router();

// Route to synchronize the Firebase User with our Postgres DB
// The frontend should call this right after a successful Firebase Signup/Login
router.post('/sync', verifyFirebaseToken, syncUser);

export default router;
