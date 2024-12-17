import { 
  User, 
  CompanyUser, 
  Employer 
} from '../models/userModel.js';
 
class EmployerProfile {
  constructor() {
    // Bind the methods to preserve 'this' context
    this.getEmployerProfile = this.getEmployerProfile.bind(this);
    this.formatProfileResponse = this.formatProfileResponse.bind(this);
  }

  async getEmployerProfile(req, res) {
    try {
      // Get userId from the authenticated user object set by middleware
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - User ID not found'
        });
      }

      // Check if user is an employer
      const user = await User.findById(userId);
      if (!user || user.role !== 'employer') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only employers can access this profile'
        });
      }

      // If the profile is already populated by the middleware, use it
      if (req.user.profile) {
        const response = this.formatProfileResponse(req.user.profile);
        return res.status(200).json(response);
      }

      // Fetch the CompanyUser linked to the authenticated user
      const companyUser = await CompanyUser.findOne({ user: userId })
        .populate('employer') // Populate employer to get details
        .populate({
          path: 'employer',
          populate: [
            { path: 'companyInfo' },  // Populate company info
            { path: 'contactPerson' }, // Populate contact person
            { path: 'pwdSupport' }      // Populate PWD support
          ]
        });

      if (!companyUser) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      const response = this.formatProfileResponse(companyUser);
      return res.status(200).json(response);

    } catch (error) {
      console.error('Error in getEmployerProfile:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  formatProfileResponse(companyUser) {
    // Return the data without the extra "data" wrapper to match frontend expectations
    return {
      success: true,
      user: companyUser.user ? {
        email: companyUser.user.email,
      } : null,
      employer: companyUser.employer ? {
        companyInfo: companyUser.employer.companyInfo ? {
          companyName: companyUser.employer.companyInfo.companyName,
          industry: companyUser.employer.companyInfo.industry,
          companySize: companyUser.employer.companyInfo.companySize,
          website: companyUser.employer.companyInfo.website,
          companyDescription: companyUser.employer.companyInfo.companyDescription,
          companyLogo: companyUser.employer.companyInfo.companyLogo,
        } : null,
        contactPerson: companyUser.employer.contactPerson ? {
          fullName: companyUser.employer.contactPerson.fullName,
          position: companyUser.employer.contactPerson.position,
          phoneNumber: companyUser.employer.contactPerson.phoneNumber,
          email: companyUser.employer.contactPerson.email,
          alternativePhoneNumber: companyUser.employer.contactPerson.alternativePhoneNumber,
          linkedIn: companyUser.employer.contactPerson.linkedIn,
        } : null,
        pwdSupport: companyUser.employer.pwdSupport ? {
          accessibilityFeatures: companyUser.employer.pwdSupport.accessibilityFeatures,
          remoteWorkOptions: companyUser.employer.pwdSupport.remoteWorkOptions,
          supportPrograms: companyUser.employer.pwdSupport.supportPrograms,
          additionalInfo: companyUser.employer.pwdSupport.additionalInfo
        } : null
      } : null
    };
  }
}

// Create and export a single instance
const employerProfile = new EmployerProfile();

export default employerProfile;
