import { Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { generateConsultationSummary } from '../services/consultationService';

const prisma = new PrismaClient();

// Prisma-generated type for a ConsultationRoom record
type ConsultationRoom = Prisma.ConsultationRoomGetPayload<Record<string, never>>;

// ──────────────────────────────────────────────────────────────────────────────
// Helper: verify the requesting user is the lawyer OR client on this appointment
// ──────────────────────────────────────────────────────────────────────────────
async function assertRoomAccess(appointmentId: string, userId: string) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { lawyer: { select: { userId: true } } },
  });
  if (!appt) {
    const err = new Error('Appointment not found') as Error & { statusCode: number };
    err.statusCode = 404;
    throw err;
  }

  const isClient = appt.userId === userId;
  const isLawyer = appt.lawyer?.userId === userId;
  if (!isClient && !isLawyer) {
    const err = new Error('Access denied: you are not a participant in this consultation') as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }

  const lawyerUserId = appt.lawyer?.userId ?? '';
  const role: 'lawyer' | 'client' = isLawyer ? 'lawyer' : 'client';
  return { appt, role, lawyerUserId };
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/consultations/:appointmentId/room
// Returns (or auto-creates) the consultation room for an appointment,
// together with participant info so the frontend can un-hardcode names.
// ──────────────────────────────────────────────────────────────────────────────
export const getOrCreateRoom = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const { appt, role, lawyerUserId } = await assertRoomAccess(appointmentId, req.user.id);

    // Upsert the room
    let room: ConsultationRoom | null = await prisma.consultationRoom.findUnique({ where: { appointmentId } });
    if (!room) {
      room = await prisma.consultationRoom.create({ data: { appointmentId } });
    }

    // Fetch participant details
    const clientUser = await prisma.user.findUnique({
      where: { id: appt.userId },
      select: { id: true, name: true, email: true },
    });
    const lawyerUser = await prisma.user.findUnique({
      where: { id: lawyerUserId },
      select: { id: true, name: true, email: true },
    });

    res.json({
      room,
      appointment: {
        id: appt.id,
        scheduledAt: appt.scheduledAt,
        caseDescription: appt.caseDescription,
        status: appt.status,
      },
      participants: { client: clientUser, lawyer: lawyerUser },
      myRole: role,
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/consultations/:appointmentId/join
// Records that this participant has joined; activates room if both are present.
// ──────────────────────────────────────────────────────────────────────────────
export const joinRoom = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const { appt, role, lawyerUserId } = await assertRoomAccess(appointmentId, req.user.id);

    let room: ConsultationRoom | null = await prisma.consultationRoom.findUnique({ where: { appointmentId } });
    if (!room) {
      room = await prisma.consultationRoom.create({ data: { appointmentId } });
    }

    const now = new Date();

    type RoomUpdateData = {
      lawyerJoinedAt?: Date;
      clientJoinedAt?: Date;
      status?: string;
      startedAt?: Date;
    };

    const updateData: RoomUpdateData = {};

    if (role === 'lawyer' && !room.lawyerJoinedAt) {
      updateData.lawyerJoinedAt = now;
    } else if (role === 'client' && !room.clientJoinedAt) {
      updateData.clientJoinedAt = now;
    }

    // Activate room when both have joined
    const willBothJoined =
      (role === 'lawyer' ? true : !!room.lawyerJoinedAt) &&
      (role === 'client' ? true : !!room.clientJoinedAt);

    if (willBothJoined && room.status === 'waiting') {
      updateData.status = 'active';
      updateData.startedAt = now;
    }

    room = await prisma.consultationRoom.update({
      where: { appointmentId },
      data: updateData,
    });

    const clientUser = await prisma.user.findUnique({
      where: { id: appt.userId },
      select: { id: true, name: true, email: true },
    });
    const lawyerUser = await prisma.user.findUnique({
      where: { id: lawyerUserId },
      select: { id: true, name: true, email: true },
    });

    res.json({ room, participants: { client: clientUser, lawyer: lawyerUser }, myRole: role });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/consultations/:appointmentId/leave
// Ends the consultation room.
// ──────────────────────────────────────────────────────────────────────────────
export const leaveRoom = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    await assertRoomAccess(appointmentId, req.user.id);

    const room = await prisma.consultationRoom.findUnique({ where: { appointmentId } });
    if (room && room.status !== 'ended') {
      await prisma.consultationRoom.update({
        where: { appointmentId },
        data: { status: 'ended', endedAt: new Date() },
      });
    }

    res.json({ message: 'Left consultation room' });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/consultations/:appointmentId/messages
// Fetch all chat messages for a room.
// ──────────────────────────────────────────────────────────────────────────────
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    await assertRoomAccess(appointmentId, req.user.id);

    const room = await prisma.consultationRoom.findUnique({ where: { appointmentId } });
    if (!room) {
      res.json([]);
      return;
    }

    const messages = await prisma.consultationMessage.findMany({
      where: { roomId: room.id },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/consultations/:appointmentId/messages
// Post a new message (REST fallback; primary path is Socket.io).
// ──────────────────────────────────────────────────────────────────────────────
export const postMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const { text } = req.body as { text?: string };
    const { role } = await assertRoomAccess(appointmentId, req.user.id);

    if (!text?.trim()) {
      res.status(400).json({ message: 'Message text is required' });
      return;
    }

    let room: ConsultationRoom | null = await prisma.consultationRoom.findUnique({ where: { appointmentId } });
    if (!room) {
      room = await prisma.consultationRoom.create({ data: { appointmentId } });
    }

    const message = await prisma.consultationMessage.create({
      data: {
        roomId: room.id,
        senderUserId: req.user.id,
        senderRole: role,
        text: text.trim(),
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/consultations/:appointmentId/summary
// Generate an AI summary using Gemini and persist it.
// ──────────────────────────────────────────────────────────────────────────────
export const generateSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const { lawyerNotes } = req.body as { lawyerNotes?: string };
    const { appt, role, lawyerUserId } = await assertRoomAccess(appointmentId, req.user.id);

    if (role !== 'lawyer') {
      res.status(403).json({ message: 'Only the lawyer can generate the consultation summary' });
      return;
    }

    const room = await prisma.consultationRoom.findUnique({ where: { appointmentId } });
    if (!room) {
      res.status(404).json({ message: 'Consultation room not found' });
      return;
    }

    const messages = await prisma.consultationMessage.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: 'asc' },
    });

    const clientUser = await prisma.user.findUnique({
      where: { id: appt.userId },
      select: { name: true },
    });
    const lawyerUser = await prisma.user.findUnique({
      where: { id: lawyerUserId },
      select: { name: true },
    });

    const summaryData = await generateConsultationSummary({
      caseDescription: appt.caseDescription,
      lawyerNotes: lawyerNotes ?? '',
      chatHistory: messages.map((m: { senderRole: string; text: string; createdAt: Date }) => ({
        senderRole: m.senderRole,
        text: m.text,
        createdAt: m.createdAt,
      })),
      participantNames: {
        lawyer: lawyerUser?.name ?? 'Advocate',
        client: clientUser?.name ?? 'Client',
      },
    });

    // Persist the summary to the room
    await prisma.consultationRoom.update({
      where: { appointmentId },
      data: { summaryJson: JSON.stringify(summaryData) },
    });

    res.json(summaryData);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/consultations/my
// List all consultation rooms for the authenticated user (as lawyer or client).
// ──────────────────────────────────────────────────────────────────────────────
export const getMyConsultations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id as string;

    // Get lawyer profile if exists
    const lawyerProfile = await prisma.lawyer.findUnique({ where: { userId } });

    const appointments = await prisma.appointment.findMany({
      where: lawyerProfile
        ? { OR: [{ userId }, { lawyerId: lawyerProfile.id }] }
        : { userId },
      include: {
        consultationRoom: true,
        lawyer: { include: { user: { select: { name: true } } } },
        user: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    res.json(appointments);
  } catch (err) {
    next(err);
  }
};
