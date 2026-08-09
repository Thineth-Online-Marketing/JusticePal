import express from 'express';
import { getLegalNews } from '../controllers/legalNewsController';

const router = express.Router();

router.get('/legal-news', getLegalNews);

export default router;
