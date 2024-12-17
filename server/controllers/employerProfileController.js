import { Employer, CompanyInfo, ContactPerson, PWDSupport } from '../models/userModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getEmployerProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Getting profile for userId:', userId);

    const employer = await Employer.findOne({ user: userId })
      .populate({
        path: 'companyInfo',
        select: 'companyName industry companySize website companyDescription companyAddress departments companyLogo establishmentDate'
      })
      .populate({
        path: 'contactPerson',
        select: 'fullName position phoneNumber alternativePhoneNumber email linkedIn department'
      })
      .populate({
        path: 'pwdSupport',
        select: 'accessibilityFeatures remoteWorkOptions supportPrograms additionalInfo'
      })
      .lean();

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    const profileData = {
      companyInfo: {
        companyName: employer.companyInfo?.companyName || '',
        industry: employer.companyInfo?.industry || [],
        companySize: employer.companyInfo?.companySize || '',
        website: employer.companyInfo?.website || '',
        companyDescription: employer.companyInfo?.companyDescription || '',
        companyAddress: employer.companyInfo?.companyAddress || {
          street: '',
          city: '',
          province: '',
          country: '',
          postalCode: ''
        },
        departments: employer.companyInfo?.departments || [],
        companyLogo: employer.companyInfo?.companyLogo || null,
        establishmentDate: employer.companyInfo?.establishmentDate || null
      },
      contactPerson: {
        fullName: employer.contactPerson?.fullName || '',
        position: employer.contactPerson?.position || '',
        phoneNumber: employer.contactPerson?.phoneNumber || '',
        alternativePhoneNumber: employer.contactPerson?.alternativePhoneNumber || '',
        email: employer.contactPerson?.email || '',
        linkedIn: employer.contactPerson?.linkedIn || '',
        department: employer.contactPerson?.department || []
      },
      pwdSupport: {
        accessibilityFeatures: employer.pwdSupport?.accessibilityFeatures || [],
        remoteWorkOptions: employer.pwdSupport?.remoteWorkOptions || false,
        supportPrograms: employer.pwdSupport?.supportPrograms || [],
        additionalInfo: employer.pwdSupport?.additionalInfo || ''
      }
    };

    console.log('Sending profile data:', profileData);

    return res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Error in getEmployerProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching employer profile',
      error: error.message
    });
  }
};

export const updateCompanyInfo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const employer = await Employer.findOne({ user: userId });

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    const updatedCompanyInfo = await CompanyInfo.findByIdAndUpdate(
      employer.companyInfo,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedCompanyInfo
    });

  } catch (error) {
    console.error('Error updating company info:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating company information',
      error: error.message
    });
  }
};

export const updateContactPerson = async (req, res) => {
  try {
    const userId = req.params.userId;
    const employer = await Employer.findOne({ user: userId });

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    const updatedContactPerson = await ContactPerson.findByIdAndUpdate(
      employer.contactPerson,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedContactPerson
    });

  } catch (error) {
    console.error('Error updating contact person:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating contact person',
      error: error.message
    });
  }
};

export const updatePwdSupport = async (req, res) => {
  try {
    const userId = req.params.userId;
    const employer = await Employer.findOne({ user: userId });

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    const updatedPwdSupport = await PWDSupport.findByIdAndUpdate(
      employer.pwdSupport,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedPwdSupport
    });

  } catch (error) {
    console.error('Error updating PWD support:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating PWD support',
      error: error.message
    });
  }
};

export const updateCompanyLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('Uploaded file:', req.file);
    console.log('File path:', req.file.path);

    const userId = req.params.userId;
    const employer = await Employer.findOne({ user: userId });

    if (!employer) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    // Create URL for the uploaded file
    const logoUrl = `/uploads/${req.file.filename}`;
    console.log('Logo URL to be saved:', logoUrl);

    // Delete old logo if exists
    if (employer.companyInfo?.companyLogo) {
      const oldPath = path.join(__dirname, '..', employer.companyInfo.companyLogo);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (error) {
        console.error('Error deleting old logo:', error);
        // Continue even if old file deletion fails
      }
    }

    // Update company info with new logo URL
    const updatedCompanyInfo = await CompanyInfo.findByIdAndUpdate(
      employer.companyInfo,
      { $set: { companyLogo: logoUrl } },
      { new: true }
    );

    console.log('Updated company info:', updatedCompanyInfo);

    // Verify file exists
    console.log('File exists after update?', fs.existsSync(req.file.path));
    console.log('Final file path:', req.file.path);

    return res.status(200).json({
      success: true,
      data: updatedCompanyInfo
    });

  } catch (error) {
    console.error('Error updating company logo:', error);
    // Clean up uploaded file if there's an error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file after error:', unlinkError);
      }
    }
    return res.status(500).json({
      success: false,
      message: 'Error updating company logo',
      error: error.message
    });
  }
}; 