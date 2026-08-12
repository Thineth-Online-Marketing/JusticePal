import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../lib/prisma';

// Type helper cast for dynamically generated models
const db = prisma as any;

/**
 * GET /api/inbox/conversations
 * Returns all conversations for the authenticated user (as client OR lawyer),
 * eagerly loading the 'other' user's profile and the most recent message.
 * Ordered by lastMessageAt descending.
 */
export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!db.conversation) {
      console.warn("Prisma conversation model not loaded");
      res.json([]);
      return;
    }

    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { clientId: userId },
          { lawyerId: userId },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            lawyerProfile: {
              select: {
                specialization: true,
                profilePicture: true,
                isVerified: true,
              },
            },
          },
        },
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            lawyerProfile: {
              select: {
                specialization: true,
                profilePicture: true,
                isVerified: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            text: true,
            senderId: true,
            read: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Transform: attach "otherUser" and "lastMessage" for frontend convenience
    const result = conversations.map((conv: any) => {
      const isClient = conv.clientId === userId;
      const otherUser = isClient ? conv.lawyer : conv.client;
      const lastMessage = conv.messages[0] || null;

      // Count unread messages sent by the OTHER user
      const hasUnread = lastMessage ? (!lastMessage.read && lastMessage.senderId !== userId) : false;

      return {
        id: conv.id,
        appointmentId: conv.appointmentId,
        otherUser,
        lastMessage,
        lastMessageAt: conv.lastMessageAt,
        hasUnread,
        createdAt: conv.createdAt,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    next(error);
  }
};

/**
 * GET /api/inbox/conversations/:conversationId/messages
 * Returns all messages for a specific conversation, paginated.
 * Query params: ?take=50&cursor=<messageId>
 */
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { conversationId } = req.params;
    const take = Math.min(parseInt(req.query.take as string) || 50, 100);
    const cursor = req.query.cursor as string | undefined;

    if (!db.conversation || !db.directMessage) {
      res.json([]);
      return;
    }

    // Verify the user belongs to this conversation
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    if (conversation.clientId !== userId && conversation.lawyerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const messages = await db.directMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });

    // Mark unread messages from the other user as read
    await db.directMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    next(error);
  }
};

/**
 * POST /api/inbox/send
 * Creates a DirectMessage, updates the parent Conversation's lastMessageAt,
 * and returns the new message.
 * Body: { conversationId, content }
 */
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { conversationId, content } = req.body;

    if (!conversationId || !content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'conversationId and content are required' });
      return;
    }

    if (!db.conversation || !db.directMessage) {
      res.status(500).json({ error: 'Database service unavailable' });
      return;
    }

    // Verify the sender belongs to this conversation
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    if (conversation.clientId !== userId && conversation.lawyerId !== userId) {
      res.status(403).json({ error: 'You are not a participant in this conversation' });
      return;
    }

    // Use a transaction to create message + update conversation atomically
    const [message] = await prisma.$transaction([
      db.directMessage.create({
        data: {
          conversationId,
          senderId: userId,
          text: content.trim(),
        },
        include: {
          sender: {
            select: { id: true, name: true },
          },
        },
      }),
      db.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    next(error);
  }
};

/**
 * POST /api/inbox/conversations
 * Creates a new conversation between the authenticated user and a lawyer.
 * Body: { lawyerId, appointmentId? }
 * Uses upsert to respect the @@unique([clientId, lawyerId]) constraint.
 */
export const createConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { lawyerId, appointmentId } = req.body;

    if (!lawyerId) {
      res.status(400).json({ error: 'lawyerId is required' });
      return;
    }

    if (!db.conversation) {
      res.status(500).json({ error: 'Database service unavailable' });
      return;
    }

    // Verify the target lawyer user exists
    const lawyerUser = await prisma.user.findUnique({
      where: { id: lawyerId },
      select: { id: true, role: true },
    });

    if (!lawyerUser) {
      res.status(404).json({ error: 'Lawyer user not found' });
      return;
    }

    // Upsert: find existing or create new conversation
    const conversation = await db.conversation.upsert({
      where: {
        clientId_lawyerId: {
          clientId: userId,
          lawyerId: lawyerId,
        },
      },
      update: {}, // If it already exists, just return it
      create: {
        clientId: userId,
        lawyerId: lawyerId,
        appointmentId: appointmentId || null,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        lawyer: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    next(error);
  }
};
