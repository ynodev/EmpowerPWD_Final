import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use Render's persistent disk path if available, otherwise fallback
const uploadsDir = process.env.UPLOAD_PATH 
  ? path.resolve(process.env.UPLOAD_PATH)
  : path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists with more robust creation
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created:', uploadsDir);
  }
} catch (err) {
  console.error('Error creating uploads directory:', err);
}

// Log the actual uploads directory path
console.log('Configured uploads directory:', uploadsDir);

// Configure multer for file uploads with more flexible naming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Upload destination:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${file.fieldname}-${uniqueSuffix}-${sanitizedOriginalName}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'application/pdf', 
    'image/svg+xml',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('companyLogo');

// Create a middleware function to handle multer errors with more detailed logging
export const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer upload error:', err);
      
      // Specific error handling
      switch(err.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.',
            error: err.message
          });
        case 'LIMIT_UNEXPECTED_FILE':
          return res.status(400).json({
            success: false,
            message: 'Unexpected file field.',
            error: err.message
          });
        default:
          return res.status(400).json({
            success: false,
            message: 'File upload error',
            error: err.message
          });
      }
    } else if (err) {
      console.error('Unknown upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'Unknown error occurred during upload',
        error: err.message
      });
    }
    
    // Log successful upload
    if (req.file) {
      console.log('File uploaded successfully:', req.file.filename);
    }
    
    next();
  });
};

// Export uploads directory for use in other parts of the application
export { uploadsDir };
