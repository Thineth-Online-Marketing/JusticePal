import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { queryKnowledge, queryLawyers } from '../services/pineconeService';

const prisma = new PrismaClient();

/**
 * POST /api/ai/chat
 * AI Legal Chatbot — Answers legal questions using Pinecone knowledge base
 */
export const chatWithAI = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Query Pinecone for relevant legal knowledge
    const results = await queryKnowledge(message.trim(), 5);

    if (results.length === 0) {
      res.json({
        answer:
          'I could not find specific information about your question in my legal knowledge base. Please try rephrasing your question, or consult a lawyer for personalized advice.',
        sources: [],
        confidence: 0,
      });
      return;
    }

    // Build a structured answer from the top results
    const topResult = results[0];
    const confidence = Math.round((topResult.score || 0) * 100);

    // Combine relevant sources into a comprehensive answer
    const answerParts: string[] = [];
    const sources: { title: string; source: string; category: string; relevance: number }[] = [];

    for (const result of results) {
      if ((result.score || 0) > 0.3) {
        answerParts.push(result.metadata.content);
        sources.push({
          title: result.metadata.title || 'Legal Reference',
          source: result.metadata.source,
          category: result.metadata.category,
          relevance: Math.round((result.score || 0) * 100),
        });
      }
    }

    const answer =
      answerParts.length > 0
        ? answerParts.join('\n\n---\n\n')
        : 'I found some related information, but the relevance is low. Please consult a qualified lawyer for accurate advice.';

    res.json({
      answer,
      sources,
      confidence,
      disclaimer:
        'This information is for educational purposes only and does not constitute legal advice. Please consult a qualified lawyer for your specific situation.',
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    next(error);
  }
};

/**
 * POST /api/ai/match-lawyers
 * Smart Lawyer Matching — Finds best-matching lawyers for a legal issue
 */
export const matchLawyers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      res.status(400).json({ error: 'Description of your legal issue is required' });
      return;
    }

    // Query Pinecone for matching lawyer profiles
    const results = await queryLawyers(description.trim(), 10);

    if (results.length === 0) {
      res.json({
        lawyers: [],
        message: 'No matching lawyers found. Please try describing your legal issue differently.',
      });
      return;
    }

    // Enrich results with full lawyer data from database
    const enrichedLawyers = await Promise.all(
      results
        .filter((r) => (r.score || 0) > 0.2)
        .map(async (result) => {
          const lawyerId = result.id.replace('lawyer-', '');

          // Get full lawyer profile from database
          const lawyer = await prisma.lawyer.findUnique({
            where: { id: lawyerId },
            include: {
              user: { select: { name: true, email: true } },
            },
          });

          if (!lawyer) return null;

          return {
            id: lawyer.id,
            name: lawyer.user.name,
            email: lawyer.user.email,
            specializations: lawyer.specialization,
            location: lawyer.location,
            bio: lawyer.bio,
            hourlyRate: lawyer.hourlyRate,
            profilePicture: lawyer.profilePicture,
            isVerified: lawyer.isVerified,
            matchScore: Math.round((result.score || 0) * 100),
          };
        })
    );

    const validLawyers = enrichedLawyers.filter(Boolean);

    res.json({
      lawyers: validLawyers,
      totalMatches: validLawyers.length,
      message:
        validLawyers.length > 0
          ? `Found ${validLawyers.length} lawyers matching your legal needs.`
          : 'No matching lawyers found in our database.',
    });
  } catch (error) {
    console.error('Lawyer matching error:', error);
    next(error);
  }
};
