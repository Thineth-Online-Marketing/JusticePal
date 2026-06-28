import { Request, Response, NextFunction } from 'express';
import {
  listAllKnowledge,
  upsertKnowledge,
  deleteKnowledge,
  LegalDocument,
} from '../services/pineconeService';

/**
 * GET /api/admin/knowledge
 * List all legal knowledge entries from the Pinecone index
 */
export const getAllKnowledge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await listAllKnowledge();

    const entries = results.map((r) => ({
      id: r.id,
      title: r.metadata.title || 'Untitled',
      content: r.metadata.content || '',
      category: r.metadata.category || 'Unknown',
      source: r.metadata.source || 'Unknown',
      type: r.metadata.type || 'law',
    }));

    res.json({
      entries,
      total: entries.length,
    });
  } catch (error) {
    console.error('Error listing knowledge:', error);
    next(error);
  }
};

/**
 * POST /api/admin/knowledge
 * Add a new legal knowledge entry to the Pinecone index
 */
export const addKnowledge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, category, source, type } = req.body;

    // Validation
    if (!title || !content || !category || !source || !type) {
      res.status(400).json({
        error: 'All fields are required: title, content, category, source, type',
      });
      return;
    }

    const validTypes = ['law', 'faq', 'procedure'];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
      });
      return;
    }

    // Generate a unique ID using timestamp
    const id = `admin-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const doc: LegalDocument = {
      id,
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      source: source.trim(),
      type,
    };

    const count = await upsertKnowledge([doc]);

    res.status(201).json({
      message: `Successfully added knowledge entry`,
      entry: {
        id: `legal-${id}`,
        title: doc.title,
        content: doc.content,
        category: doc.category,
        source: doc.source,
        type: doc.type,
      },
      upserted: count,
    });
  } catch (error) {
    console.error('Error adding knowledge:', error);
    next(error);
  }
};

/**
 * DELETE /api/admin/knowledge/:id
 * Delete a legal knowledge entry from the Pinecone index
 */
export const removeKnowledge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Knowledge entry ID is required' });
      return;
    }

    await deleteKnowledge(id);

    res.json({
      message: 'Knowledge entry deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    console.error('Error deleting knowledge:', error);
    next(error);
  }
};
