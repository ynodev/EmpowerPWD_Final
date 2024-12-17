import { CompanyInfo, Employer } from '../models/userModel.js';
import Application from '../models/jobApplicationModel.js';
import Review from '../models/Review.js';
import mongoose from 'mongoose';

export const submitCompanyReview = async (req, res) => {
  try {
    const { applicationId, jobId, companyId: employerUserId, rating, review } = req.body;

    // Get the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get the employer and company info
    const employer = await Employer.findOne({ user: employerUserId });
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    // Create new review
    const newReview = new Review({
      companyId: employer.companyInfo,
      jobseekerId: application.jobseeker,
      jobId: jobId,
      applicationId: applicationId,
      rating: rating,
      review: review
    });

    // Save the review
    await newReview.save();

    // Update company's average rating
    const allCompanyReviews = await Review.find({ companyId: employer.companyInfo });
    const totalRatings = allCompanyReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings / allCompanyReviews.length;

    // Update company's average rating
    await CompanyInfo.findByIdAndUpdate(employer.companyInfo, {
      averageRating: averageRating
    });

    // Update application to mark as reviewed
    await Application.findByIdAndUpdate(applicationId, {
      'reviewDetails.hasReviewed': true,
      'reviewDetails.reviewedAt': new Date(),
      'reviewDetails.reviewId': newReview._id
    });

    res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review: newReview,
        averageRating: averageRating
      }
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
};

export const getCompanyReviews = async (req, res) => {
  try {
    const { companyId } = req.params;

    const reviews = await Review.find({ companyId })
      .populate('jobseekerId', 'email')
      .populate('jobId', 'jobTitle')
      .sort({ createdAt: -1 });

    const company = await CompanyInfo.findById(companyId);

    res.status(200).json({
      success: true,
      data: {
        reviews: reviews,
        averageRating: company.averageRating
      }
    });

  } catch (error) {
    console.error('Error fetching company reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

export const checkExistingReview = async (req, res) => {
  try {
    const { applicationId, companyId } = req.params;

    console.log('Checking for review with:', { applicationId, companyId });

    // First get the application to get the jobseeker ID
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get the employer to get the correct companyId
    const employer = await Employer.findOne({ user: companyId });
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    // Check for existing review that matches both applicationId and companyId
    const review = await Review.findOne({
      applicationId: applicationId,
      companyId: employer.companyInfo
    });

    console.log('Found review:', review);

    res.status(200).json({
      success: true,
      exists: !!review,
      matchesBoth: !!review // This will be true only if both IDs match
    });

  } catch (error) {
    console.error('Error checking review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review',
      error: error.message
    });
  }
}; 