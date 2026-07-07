import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import admin from 'firebase-admin';

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
import { errorHandler } from './middleware/errorMiddleware';
import { initNotificationSocket } from './utils/notificationHelper';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5000;

const prisma = new PrismaClient();

// ── Allowed origins ──────────────────────────────────────────────
const allowedOrigins = [
  'https://justice-pal.vercel.app',
  'http://localhost:3000',
];

// ── CORS ─────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Socket.io server ─────────────────────────────────────────────
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Initialize global notification emitter
initNotificationSocket(io);

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

  // Real-Time Notifications infrastructure: Join private user room
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`User [${userId}] connected to private notification room`);
  }

  // Join a consultation room (identified by appointmentId)
  socket.on('join_consultation', async ({ appointmentId }: { appointmentId: string }) => {
    try {
      // Verify access
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

      // Notify others in room
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

  // Send a chat message
  socket.on('send_message', async ({ appointmentId, text }: { appointmentId: string; text: string }) => {
    try {
      if (!text?.trim() || !appointmentId) return;

      // Verify access and get role
      const appt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { lawyer: { select: { userId: true } } },
      });
      if (!appt) return socket.emit('error', { message: 'Appointment not found' });

      const isLawyer = appt.lawyer?.userId === userId;
      const isClient = appt.userId === userId;
      if (!isClient && !isLawyer) return socket.emit('error', { message: 'Access denied' });

      const senderRole = isLawyer ? 'lawyer' : 'client';

      // Get or create room
      let room = await prisma.consultationRoom.findUnique({ where: { appointmentId } });
      if (!room) {
        room = await prisma.consultationRoom.create({ data: { appointmentId } });
      }

      // Persist message
      const message = await prisma.consultationMessage.create({
        data: {
          roomId: room.id,
          senderUserId: userId,
          senderRole,
          text: text.trim(),
        },
        include: { sender: { select: { id: true, name: true } } },
      });

      // Broadcast to everyone in the room (including sender)
      const roomKey = `consultation:${appointmentId}`;
      io.to(roomKey).emit('new_message', message);
    } catch (err) {
      console.error('[Socket] send_message error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ appointmentId, isTyping }: { appointmentId: string; isTyping: boolean }) => {
    const roomKey = `consultation:${appointmentId}`;
    socket.to(roomKey).emit('participant_typing', { userId, name: userName, isTyping });
  });

  socket.on('disconnect', () => {
    // Could broadcast disconnect to room here if needed
  });
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
app.use('/api/consultations', consultationRoutes);
app.use('/api/profile', profileRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server locally — Vercel handles this automatically in production
if (!process.env.VERCEL) {
  httpServer.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Socket.io is ready for real-time consultation chat`);
  });
}

// Export for Vercel serverless
export default app;
