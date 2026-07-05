import express from 'express';
import { 
  uploadCaseFile, 
  getCaseFiles, 
  deleteCaseFile,
  generateUploadUrl,
  generateDownloadUrl
} from '../controllers/caseFileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/upload-url')
  .post(protect, generateUploadUrl);

router.route('/download-url/:fileId')
  .get(protect, generateDownloadUrl);

router.route('/')
  .post(protect, uploadCaseFile)
  .get(protect, getCaseFiles);

router.route('/:id')
  .delete(protect, deleteCaseFile);

export default router;
