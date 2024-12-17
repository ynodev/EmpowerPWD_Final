import { 
  User, 
  CompanyInfo, 
  ContactPerson, 
  PWDSupport, 
  Employer 
} from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { handleEmployerDocuments } from '../utils/documentHandler.js';

export const createEmployer = async (req, res) => {
  try {
    const {
      email,
      password,
      companyInfo,
      contactPerson,
      pwdSupport
    } = req.body;

    // 1. Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'employer'
    });

    // 2. Create CompanyInfo
    const parsedCompanyInfo = typeof companyInfo === 'string' ? JSON.parse(companyInfo) : companyInfo;
    const companyInfoDoc = await CompanyInfo.create({
      ...parsedCompanyInfo,
      industry: Array.isArray(parsedCompanyInfo.industry) 
        ? parsedCompanyInfo.industry 
        : JSON.parse(parsedCompanyInfo.industry || '[]'),
      departments: Array.isArray(parsedCompanyInfo.departments)
        ? parsedCompanyInfo.departments
        : JSON.parse(parsedCompanyInfo.departments || '[]')
    });

    // 3. Create ContactPerson
    const parsedContactPerson = typeof contactPerson === 'string' ? JSON.parse(contactPerson) : contactPerson;
    const contactPersonDoc = await ContactPerson.create({
      ...parsedContactPerson,
      department: Array.isArray(parsedContactPerson.department)
        ? parsedContactPerson.department
        : JSON.parse(parsedContactPerson.department || '[]')
    });

    // 4. Create PWDSupport
    const parsedPWDSupport = typeof pwdSupport === 'string' ? JSON.parse(pwdSupport) : pwdSupport;
    const pwdSupportDoc = await PWDSupport.create({
      ...parsedPWDSupport,
      accessibilityFeatures: Array.isArray(parsedPWDSupport.accessibilityFeatures)
        ? parsedPWDSupport.accessibilityFeatures
        : JSON.parse(parsedPWDSupport.accessibilityFeatures || '[]'),
      supportPrograms: Array.isArray(parsedPWDSupport.supportPrograms)
        ? parsedPWDSupport.supportPrograms
        : JSON.parse(parsedPWDSupport.supportPrograms || '[]')
    });

    // 5. Handle document uploads
    const documentPaths = {};

    if (req.files) {
      Object.entries(req.files).forEach(([fieldName, files]) => {
        if (fieldName === 'otherDocs') {
          documentPaths.otherDocs = files.map(file => ({
            path: file.path,
            originalName: file.originalname,
            mimeType: file.mimetype
          }));
        } else {
          const file = files[0];
          documentPaths[fieldName] = {
            path: file.path,
            originalName: file.originalname,
            mimeType: file.mimetype
          };
        }
      });
    }

    // 6. Create Employer with references
    const employer = await Employer.create({
      user: user._id,
      companyInfo: companyInfoDoc._id,
      contactPerson: contactPersonDoc._id,
      pwdSupport: pwdSupportDoc._id,
      documents: documentPaths
    });

    res.status(201).json({
      success: true,
      message: 'Employer registered successfully',
      data: employer
    });

  } catch (error) {
    console.error('Error creating employer:', error);

    // Clean up any created documents if there's an error
    // Add cleanup logic here if needed

    res.status(500).json({
      success: false,
      message: 'Error creating employer',
      error: error.message
    });
  }
};

export const getEmployerById = async (req, res) => {
  // Implementation
};

export const updateEmployer = async (req, res) => {
  // Implementation
};

export const deleteEmployer = async (req, res) => {
  // Implementation
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.userId;

    // First find the user document
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
};
