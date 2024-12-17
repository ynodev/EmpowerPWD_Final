import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { submitCompanyReview, checkExistingReview } from '../controllers/reviewController.js';
import Review from '../models/Review.js';
import { JobSeeker, BasicInfo } from '../models/userModel.js';

const router = express.Router();

// Submit a review
router.post('/company', authMiddleware, submitCompanyReview);

// Get company reviews
router.get('/company/:companyId', async (req, res) => {
  try {
    const reviews = await Review.find({ companyId: req.params.companyId })
      .populate({
        path: 'jobseekerId',
        model: 'JobSeeker',
        populate: {
          path: 'basicInfo',
          model: 'BasicInfo'
        }
      })
      .lean();

    console.log('Found reviews:', reviews);

    // Calculate rating distribution
    const ratingDistribution = reviews.reduce((acc, review) => {
      const rating = Math.round(review.rating); // Round to nearest integer
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Transform the reviews to match the expected format
    const transformedReviews = reviews.map(review => {
      try {
        return {
          _id: review._id,
          rating: review.rating,
          review: review.review,
          createdAt: review.createdAt,
          jobseekerId: {
            basicInfo: {
              firstName: review.jobseekerId?.basicInfo?.firstName || 'Anonymous',
              lastName: review.jobseekerId?.basicInfo?.lastName || 'User',
              profilePicture: review.jobseekerId?.basicInfo?.profilePicture || ''
            }
          }
        };
      } catch (err) {
        console.error('Error transforming review:', err);
        return {
          _id: review._id,
          rating: review.rating,
          review: review.review,
          createdAt: review.createdAt,
          jobseekerId: {
            basicInfo: {
              firstName: 'Anonymous',
              lastName: 'User',
              profilePicture: ''
            }
          }
        };
      }
    });

    res.json({
      success: true,
      data: transformedReviews,
      meta: {
        totalReviews: reviews.length,
        averageRating,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// Check existing review
router.get('/check/:applicationId/:companyId', checkExistingReview);

export default router; 