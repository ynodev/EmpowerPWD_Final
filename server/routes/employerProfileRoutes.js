import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { 
  getEmployerProfile, 
  updateCompanyInfo,
  updateContactPerson,
  updatePwdSupport,
  updateCompanyLogo
} from '../controllers/employerProfileController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'company-logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .jpeg, .png and .gif format allowed!'));
    }
    cb(null, true);
  }
});

const router = express.Router();

// Get profile
router.get('/profile/:userId', getEmployerProfile);

// Update routes
router.put('/companyInfo/:userId', updateCompanyInfo);
router.put('/contactPerson/:userId', updateContactPerson);
router.put('/pwdSupport/:userId', updatePwdSupport);
router.put('/logo/:userId', upload.single('companyLogo'), updateCompanyLogo);

export default router; 