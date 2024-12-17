import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { CompanyInfo } from '../models/userModel.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get list of companies with reviews
router.get('/list/with-reviews', async (req, res) => {
  try {
    const companies = await CompanyInfo.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'companyId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          rating: {
            $avg: '$reviews.rating'
          },
          reviewCount: {
            $size: '$reviews'
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: '$companyName',
          location: {
            $concat: ['$companyAddress.city', ', ', '$companyAddress.country']
          },
          industry: { $arrayElemAt: ['$industry', 0] },
          employeeCount: '$companySize',
          logo: '$companyLogo',
          description: '$companyDescription',
          rating: 1,
          reviewCount: 1,
          createdAt: 1
        }
      }
    ]);

    console.log('Companies fetched:', companies);

    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('Error in /list/with-reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
      error: error.message
    });
  }
});

// Get detailed company information
router.get('/details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }

    const company = await CompanyInfo.findById(id).lean();
    console.log('Company found:', company);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Transform the data to match frontend expectations
    const transformedCompany = {
      _id: company._id,
      name: company.companyName,
      location: `${company.companyAddress.city}, ${company.companyAddress.country}`,
      industry: Array.isArray(company.industry) ? company.industry[0] : company.industry,
      employeeCount: company.companySize,
      logo: company.companyLogo,
      description: company.companyDescription,
      website: company.website,
      address: company.companyAddress,
      establishmentDate: company.establishmentDate,
      departments: company.departments || []
    };

    console.log('Transformed company:', transformedCompany);

    res.json({
      success: true,
      data: transformedCompany
    });
  } catch (error) {
    console.error('Error in /details/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company details',
      error: error.message
    });
  }
});

export default router;
