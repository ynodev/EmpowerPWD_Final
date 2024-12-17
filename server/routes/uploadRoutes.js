import express from 'express';
import multer from 'multer';
import { uploadsDir } from '../middleware/upload.js';

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// POST route for file uploads
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    filePath: `/uploads/${req.file.filename}`,
  });
});

export default router;
