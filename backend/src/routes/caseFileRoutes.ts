import express from 'express';
import { uploadCaseFile, getCaseFiles, deleteCaseFile } from '../controllers/caseFileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect, uploadCaseFile)
  .get(protect, getCaseFiles);

router.route('/:id')
  .delete(protect, deleteCaseFile);

export default router;
