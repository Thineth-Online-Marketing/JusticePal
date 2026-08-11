import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { queryKnowledge, queryLawyers } from '../services/pineconeService';

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

/**
 * POST /api/ai/draft-document
 * AI Document Drafting — Generates first drafts of common legal documents
 */
export const draftDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { documentType, caseDetails, clientName, lawyerName, additionalNotes } = req.body;

    if (!documentType || !caseDetails) {
      res.status(400).json({ error: 'documentType and caseDetails are required' });
      return;
    }

    // Use Google Generative AI (Gemini) for document generation
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a professional Sri Lankan legal document drafting assistant. 
Generate a formal first draft of a "${documentType}" based on the following details.

IMPORTANT RULES:
- Follow Sri Lankan legal conventions and formatting standards.
- Include proper headers, addresses, dates, and signature blocks.
- Use formal legal language appropriate for Sri Lankan courts and legal proceedings.
- Mark placeholder values with [PLACEHOLDER] brackets for the user to fill in.
- Add a disclaimer at the end noting this is an AI-generated draft that should be reviewed by a qualified lawyer.

Document Type: ${documentType}
Case Details: ${caseDetails}
${clientName ? `Client Name: ${clientName}` : ''}
${lawyerName ? `Lawyer/Attorney Name: ${lawyerName}` : ''}
${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

Generate the complete document draft now:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const draft = response.text();

    res.json({
      documentType,
      draft,
      generatedAt: new Date().toISOString(),
      disclaimer: 'This document was generated by AI and is intended as a first draft only. It should be reviewed and finalized by a qualified legal professional before use.',
    });
  } catch (error) {
    console.error('Document drafting error:', error);
    next(error);
  }
};
