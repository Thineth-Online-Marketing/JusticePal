import { Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from './notificationController';
import prisma from '../lib/prisma';

// Lazy Stripe client — only initialised when a payment route is actually called.
// This prevents startup crashes when STRIPE_SECRET_KEY is not set in .env.
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    _stripe = new Stripe(key, { apiVersion: '2026-07-29.dahlia' as any });
  }
  return _stripe;
}

/**
 * POST /api/payments/create-checkout
 * Creates a Stripe Checkout Session for a confirmed appointment.
 */
export const createCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { appointmentId, amount, lawyerName, consultationType } = req.body;

    if (!appointmentId || !amount) {
      res.status(400).json({ error: 'appointmentId and amount are required' });
      return;
    }

    // Verify appointment exists and belongs to this user
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: { select: { name: true, email: true } },
        lawyer: { include: { user: { select: { name: true } } } },
      },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    if (appointment.userId !== req.user.id) {
      res.status(403).json({ error: 'Not authorized for this appointment' });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: appointment.user.email,
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: `Legal Consultation – ${lawyerName || appointment.lawyer.user.name}`,
              description: `${consultationType || 'Video'} consultation on ${new Date(appointment.scheduledAt).toLocaleDateString()}`,
            },
            unit_amount: Math.round(Number(amount) * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentId,
        userId: req.user.id,
      },
      success_url: `${frontendUrl}/dashboard?payment=success&appointmentId=${appointmentId}`,
      cancel_url: `${frontendUrl}/dashboard?payment=cancelled`,
    });

    // Create a pending Payment record
    await prisma.payment.create({
      data: {
        appointmentId,
        amount: Number(amount),
        currency: 'LKR',
        status: 'pending',
        stripeSessionId: session.id,
      },
    });

    res.json({ sessionUrl: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    next(error);
  }
};

/**
 * POST /api/payments/webhook
 * Stripe Webhook — handles payment confirmation events.
 * NOTE: This endpoint must receive the raw body (not JSON-parsed).
 */
export const handleStripeWebhook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      (req as any).rawBody || req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const appointmentId = session.metadata?.appointmentId;

      if (appointmentId) {
        // Update payment status
        await prisma.payment.updateMany({
          where: { stripeSessionId: session.id },
          data: {
            status: 'succeeded',
            stripePaymentId: session.payment_intent as string,
            paidAt: new Date(),
          },
        });

        // Update appointment status to confirmed
        const appointment = await prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: 'confirmed' },
          include: {
            user: { select: { id: true, name: true } },
            lawyer: { include: { user: { select: { id: true, name: true } } } },
          },
        });

        // Notify both parties
        await createNotification({
          userId: appointment.userId,
          title: 'Payment Confirmed',
          message: `Your payment for the consultation with ${appointment.lawyer.user.name} has been confirmed.`,
          type: 'payment',
        });

        await createNotification({
          userId: appointment.lawyer.userId,
          title: 'Payment Received',
          message: `${appointment.user.name} has paid for the consultation on ${new Date(appointment.scheduledAt).toLocaleDateString()}.`,
          type: 'payment',
        });
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'failed' },
      });
      break;
    }
  }

  res.json({ received: true });
};

/**
 * GET /api/payments/status/:appointmentId
 * Check payment status for an appointment.
 */
export const getPaymentStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { appointmentId } = req.params;

    const payment = await prisma.payment.findFirst({
      where: { appointmentId },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      res.json({ status: 'unpaid', payment: null });
      return;
    }

    res.json({ status: payment.status, payment });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/history
 * Get payment history for the current user.
 */
export const getPaymentHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        appointment: { userId: req.user.id },
      },
      include: {
        appointment: {
          include: {
            lawyer: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    next(error);
  }
};
