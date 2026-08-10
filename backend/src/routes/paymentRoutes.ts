import { Router } from 'express';
import {
  createCheckoutSession,
  handleStripeWebhook,
  getPaymentStatus,
  getPaymentHistory,
} from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';
import express from 'express';

const router = Router();

// Stripe webhook needs raw body — must be registered before json parsing
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Protected routes
router.post('/create-checkout', protect, createCheckoutSession);
router.get('/status/:appointmentId', protect, getPaymentStatus);
router.get('/history', protect, getPaymentHistory);

export default router;
