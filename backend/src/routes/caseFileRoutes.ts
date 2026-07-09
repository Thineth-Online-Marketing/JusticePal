import express from 'express';
import multer from 'multer';
import { 
  uploadCaseFile, 
  uploadCaseFileMultipart,
  getCaseFiles, 
  deleteCaseFile,
  generateUploadUrl,
  proxyDownloadFile
} from '../controllers/caseFileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// multer: store uploaded file in memory (buffer), max 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Pre-signed URL flow (kept for other potential uses)
router.route('/upload-url')
  .post(protect, generateUploadUrl);

// Multipart upload — browser sends file to Express, Express uploads to Firebase Storage
router.route('/upload')
  .post(protect, upload.single('file'), uploadCaseFileMultipart);

// Proxy stream download — Express fetches from Firebase Storage and pipes to browser
router.route('/download/:fileId')
  .get(protect, proxyDownloadFile);

router.route('/')
  .post(protect, uploadCaseFile)
  .get(protect, getCaseFiles);

router.route('/:id')
  .delete(protect, deleteCaseFile);

export default router;
