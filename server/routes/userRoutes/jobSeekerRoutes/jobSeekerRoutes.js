import { Router } from 'express';
import {
  createJobSeeker,
  getJobSeekerById,
  updateJobSeeker,
  deleteJobSeeker
} from '../../../controllers/jobSeekerController.js';
import { assistantController } from '../../../controllers/assistantController.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer with storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create path if it doesn't exist
    const path = `uploads/jobseekers/${req.body.email}/documents`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const documentType = file.fieldname || 'document';
    cb(null, `${documentType}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure multer with file size and type restrictions
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'), false);
  }
};


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Support multiple file uploads with specific fields
const uploadFields = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'pwdId', maxCount: 1 },
  { name: 'validId', maxCount: 1 },
  { name: 'certifications', maxCount: 3 },
  { name: 'profilePhoto', maxCount: 1 }
]);

// Configure multer for assistant documents
const assistantStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = `uploads/assistants/${req.body.email}/documents`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `verification-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const assistantUpload = multer({
  storage: assistantStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter // Reuse existing fileFilter
});

// Update the assistant upload fields
const assistantUploadFields = assistantUpload.fields([
  { name: 'verificationDocument', maxCount: 1 },
  { name: 'pwdId', maxCount: 1 },
  { name: 'validId', maxCount: 1 }
]);

// Existing JobSeeker routes
router.post('/create', uploadFields, createJobSeeker);
router.get('/:id', getJobSeekerById);
router.put('/:id', uploadFields, updateJobSeeker);
router.delete('/:id', deleteJobSeeker);

// Assistant routes
router.post(
  '/assistant/register',
  assistantUploadFields,
  assistantController.registerAssistant
);

router.get(
  '/assistant/profile',
  assistantController.getAssistant
);

router.put(
  '/assistant/update',
  assistantUpload.single('verificationDocument'),
  assistantController.updateAssistant
);

router.get(
  '/assistant/list/:jobSeekerId',
  assistantController.getJobSeekerAssistants
);

router.delete(
  '/assistant/:assistantId',
  assistantController.removeAssistant
);

router.put(
  '/assistant/:assistantId/verify-document',
  assistantUpload.single('verificationDocument'),
  assistantController.verifyAssistantDocument
);

export default router;