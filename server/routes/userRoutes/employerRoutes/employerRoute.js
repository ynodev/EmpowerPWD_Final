import express from 'express';
import { authMiddleware } from '../../../middleware/authMiddlewareControl.js';
import * as employerController from '../../../controllers/employerController.js';
import { getEmployerStats } from '../../../controllers/employerStatsController.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = `uploads/employers/${req.body.email}/documents`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const documentType = req.body.documentType || 'document';
    cb(null, `${documentType}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
    }
    cb(null, true);
  }
});

// Registration route with file upload
router.post('/register', 
  upload.fields([
    { name: 'companyPermit', maxCount: 1 },
    { name: 'taxId', maxCount: 1 },
    { name: 'incorporation', maxCount: 1 },
    { name: 'otherDocs', maxCount: 5 }
  ]), 
  employerController.createEmployer
);

router.get('/dashboard/stats', authMiddleware, getEmployerStats);

// Add this route for password change
router.put('/:userId/change-password', authMiddleware, employerController.changePassword);

export default router;