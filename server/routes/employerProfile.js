import express from 'express';
import { 
  getEmployerProfile, 
  updateCompanyInfo, 
  updateContactPerson, 
  updatePwdSupport,
  updateCompanyLogo 
} from '../controllers/employerProfileController.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

// Get employer profile
router.get('/profile/:userId', getEmployerProfile);

// Update routes
router.put('/companyInfo/:userId', updateCompanyInfo);
router.put('/contactPerson/:userId', updateContactPerson);
router.put('/pwdSupport/:userId', updatePwdSupport);
router.put('/logo/:userId', uploadMiddleware, updateCompanyLogo);

export default router; 