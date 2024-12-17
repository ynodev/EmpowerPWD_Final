import { Employer } from '../models/userModel.js';

export const getAllCompanies = async (req, res) => {
 try {
   const companies = await Employer.find()
     .populate({
       path: 'companyInfo',
       select: 'companyName industry companySize companyDescription companyAddress companyLogo'
     })
     .lean();
    const formattedCompanies = companies.map(employer => ({
     id: employer._id,
     name: employer.companyInfo?.companyName,
     logo: employer.companyInfo?.companyLogo,
     industry: employer.companyInfo?.industry?.[0], // Taking first industry if multiple
     location: `${employer.companyInfo?.companyAddress?.city}, ${employer.companyInfo?.companyAddress?.province}`,
     description: employer.companyInfo?.companyDescription,
     rating: 4.5 // You might want to implement a proper rating system
   }));
    res.status(200).json({
     success: true,
     data: formattedCompanies
   });
 } catch (error) {
   console.error('Error fetching companies:', error);
   res.status(500).json({
     success: false,
     message: 'Error fetching companies',
     error: error.message
   });
 }
};

export const getCompanyById = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id)
      .populate({
        path: 'companyInfo',
        select: 'companyName industry companySize website companyDescription companyAddress companyLogo establishmentDate'
      })
      .populate({
        path: 'contactPerson',
        select: 'fullName position phoneNumber email linkedIn department'
      })
      .populate({
        path: 'pwdSupport',
        select: 'accessibilityFeatures remoteWorkOptions supportPrograms additionalInfo'
      })
      .lean();

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const companyData = {
      id: employer._id,
      name: employer.companyInfo?.companyName,
      logo: employer.companyInfo?.companyLogo,
      industry: employer.companyInfo?.industry?.[0],
      location: `${employer.companyInfo?.companyAddress?.city}, ${employer.companyInfo?.companyAddress?.province}`,
      description: employer.companyInfo?.companyDescription,
      website: employer.companyInfo?.website,
      companySize: employer.companyInfo?.companySize,
      establishmentDate: employer.companyInfo?.establishmentDate,
      contactPerson: employer.contactPerson,
      pwdSupport: employer.pwdSupport
    };

    res.status(200).json({
      success: true,
      data: companyData
    });
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company details',
      error: error.message
    });
  }
};