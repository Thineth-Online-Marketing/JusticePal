import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import admin from './config/firebase';
import userRoutes from './routes/userRoutes';
import lawyerRoutes from './routes/lawyerRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import aiRoutes from './routes/aiRoutes';
import caseFileRoutes from './routes/caseFileRoutes';
import notificationRoutes from './routes/notificationRoutes';
import googleCalendarRoutes from './routes/googleCalendarRoutes';
import consultationRoutes from './routes/consultationRoutes';
import profileRoutes from './routes/profileRoutes';
import calComRoutes from './routes/calComRoutes';
import clientRoutes from './routes/clientRoutes';
import newsRoutes from './routes/newsRoutes';
import aiV1Routes from './routes/aiV1Routes';
import paymentRoutes from './routes/paymentRoutes';
import inboxRoutes from './routes/inboxRoutes';
import lawyerEventRoutes from './routes/lawyerEventRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import { initNotificationSocket } from './utils/notificationHelper';
import { initReminderScheduler } from './utils/reminderScheduler';
import prisma from './lib/prisma';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5000;

// ── Allowed origins ──────────────────────────────────────────────
const frontendUrl = process.env.FRONTEND_URL;
const allowedOrigins = [
  frontendUrl,
  'https://justicepal.akalankanime11.workers.dev',
  'https://justice-pal.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[];

// ── CORS ─────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.workers.dev') ||
        origin.endsWith('.pages.dev') ||
        origin.endsWith('.vercel.app');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    // Store raw body for Stripe webhook signature verification
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Socket.io server ─────────────────────────────────────────────
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.workers.dev') ||
        origin.endsWith('.pages.dev') ||
        origin.endsWith('.vercel.app');
      callback(null, isAllowed);
    },
    credentials: true,
  },
});

// Initialize global notification emitter
initNotificationSocket(io);

// Initialize background cron scheduler for appointment reminders
initReminderScheduler();

// Socket.io — authentication middleware (verify Firebase token)
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error: no token'));

  try {
    // Dev bypass
    if (token === 'api-test-token') {
      (socket as any).firebaseUid = 'test-uid-casefiles-2026';
      (socket as any).userId = null;
      return next();
    }

    const decoded = await admin.auth().verifyIdToken(token);
    (socket as any).firebaseUid = decoded.uid;

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: { id: true, name: true, role: true },
    });
    if (!user) return next(new Error('User not found'));
    (socket as any).userId = user.id;
    (socket as any).userName = user.name;
    next();
  } catch (err) {
    next(new Error('Authentication error: invalid token'));
  }
});

// Socket.io — room events
io.on('connection', (socket) => {
  const userId: string = (socket as any).userId;
  const userName: string = (socket as any).userName;

  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`User [${userId}] connected to private notification room`);
  }

  // ── Consultation Events ──────────────────────────────────────────

  socket.on('join_consultation', async ({ appointmentId }: { appointmentId: string }) => {
    try {
      const appt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { lawyer: { select: { userId: true } } },
      });
      if (!appt) return socket.emit('error', { message: 'Appointment not found' });

      const isClient = appt.userId === userId;
      const isLawyer = appt.lawyer?.userId === userId;
      if (!isClient && !isLawyer) {
        return socket.emit('error', { message: 'Access denied' });
      }

      const roomKey = `consultation:${appointmentId}`;
      socket.join(roomKey);

      socket.to(roomKey).emit('participant_joined', {
        userId,
        name: userName,
        role: isLawyer ? 'lawyer' : 'client',
      });

      socket.emit('joined', { room: roomKey });
    } catch (err) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('send_message', async ({ appointmentId, text }: { appointmentId: string; text: string }) => {
    try {
      if (!text?.trim() || !appointmentId) return;

      const appt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { lawyer: { select: { userId: true } } },
      });
      if (!appt) return socket.emit('error', { message: 'Appointment not found' });

      const isLawyer = appt.lawyer?.userId === userId;
      const isClient = appt.userId === userId;
      if (!isClient && !isLawyer) return socket.emit('error', { message: 'Access denied' });

      const senderRole = isLawyer ? 'lawyer' : 'client';

      let room = await prisma.consultationRoom.findUnique({ where: { appointmentId } });
      if (!room) {
        room = await prisma.consultationRoom.create({ data: { appointmentId } });
      }

      const message = await prisma.consultationMessage.create({
        data: {
          roomId: room.id,
          senderUserId: userId,
          senderRole,
          text: text.trim(),
        },
        include: { sender: { select: { id: true, name: true } } },
      });

      const roomKey = `consultation:${appointmentId}`;
      io.to(roomKey).emit('new_message', message);
    } catch (err) {
      console.error('[Socket] send_message error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', ({ appointmentId, isTyping }: { appointmentId: string; isTyping: boolean }) => {
    const roomKey = `consultation:${appointmentId}`;
    socket.to(roomKey).emit('participant_typing', { userId, name: userName, isTyping });
  });

  // ── Inbox / Direct Messaging Events ─────────────────────────────

  socket.on('join_inbox', () => {
    if (!userId) return;
    const inboxRoom = `inbox_${userId}`;
    socket.join(inboxRoom);
    console.log(`User [${userId}] joined inbox room: ${inboxRoom}`);
  });

  socket.on('send_direct_message', async ({
    conversationId,
    receiverId,
    messageData,
  }: {
    conversationId: string;
    receiverId: string;
    messageData: { id: string; text: string; senderId: string; createdAt: string };
  }) => {
    try {
      if (!conversationId || !receiverId || !messageData) return;

      // Broadcast to the receiver's inbox room only
      io.to(`inbox_${receiverId}`).emit('receive_direct_message', {
        conversationId,
        message: messageData,
      });
    } catch (err) {
      console.error('[Socket] send_direct_message error:', err);
      socket.emit('error', { message: 'Failed to relay direct message' });
    }
  });

  // ── Disconnect ──────────────────────────────────────────────────

  socket.on('disconnect', () => {});
});

// ── REST Routes ──────────────────────────────────────────────────
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'JusticePal Backend is running' });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/case-files', caseFileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/google-calendar', googleCalendarRoutes);
app.use('/api/cal-com', calComRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api', newsRoutes);
app.use('/api/v1', aiV1Routes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/lawyer-events', lawyerEventRoutes);

// Error Handling Middleware
app.use(errorHandler);

// ── Native Node.js HTTP Listener ─────────────────────────────────
httpServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Socket.io is ready for real-time consultation chat`);
});

export default app;