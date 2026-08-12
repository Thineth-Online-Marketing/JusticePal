import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/v1/extract-case and /api/v1/extract-case-details
const extractCaseHandler = async (req: Request, res: Response) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ success: false, data: {} });
  }

  // Simple heuristic mock extraction for development
  let case_type = 'General Law';
  if (query.toLowerCase().includes('rent') || query.toLowerCase().includes('landlord') || query.toLowerCase().includes('property')) {
    case_type = 'Tenancy & Property Law';
  } else if (query.toLowerCase().includes('divorce') || query.toLowerCase().includes('child') || query.toLowerCase().includes('marriage')) {
    case_type = 'Family Law';
  } else if (query.toLowerCase().includes('crime') || query.toLowerCase().includes('police') || query.toLowerCase().includes('arrest')) {
    case_type = 'Criminal Law';
  } else if (query.toLowerCase().includes('business') || query.toLowerCase().includes('company') || query.toLowerCase().includes('corporate')) {
    case_type = 'Corporate Law';
  }

  return res.json({
    success: true,
    data: {
      case_type,
      location: query.toLowerCase().includes('kandy') ? 'Kandy' : 'Colombo',
      budget: 'Medium',
      language: query.match(/[\u0D80-\u0DFF]/) ? 'Sinhala' : 'English'
    }
  });
};

router.post('/extract-case', extractCaseHandler);
router.post('/extract-case-details', extractCaseHandler);

// POST /api/v1/match-lawyers
router.post('/match-lawyers', async (req: Request, res: Response) => {
  const { ai_suggestions, manual_filters } = req.body;
  
  try {
    // Basic Prisma search
    const lawyers = await prisma.lawyer.findMany({
      where: {
        isVerified: true
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    // Format matches for frontend
    const mappedLawyers = lawyers.map(l => ({
      id: l.id,
      name: l.user.name,
      specialization: l.specialization[0] || 'Attorney-at-Law',
      location: l.location || 'Colombo',
      rating: 4.8,
      bio: l.bio || '',
      image_url: l.profilePicture || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
      _score: 0.95
    }));

    return res.json({
      success: true,
      count: mappedLawyers.length,
      lawyers: mappedLawyers
    });
  } catch (err) {
    console.error('Mock match lawyers failed', err);
    return res.status(500).json({ success: false, error: 'Failed' });
  }
});

export default router;
