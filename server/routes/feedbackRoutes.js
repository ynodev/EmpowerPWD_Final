import express from 'express';
import Feedback from '../models/Feedback.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create feedback
router.post('/', authMiddleware, async (req, res) => {
  console.log('Received feedback request:', req.body);
  console.log('User from auth:', req.user);
  console.log('Full request body:', req.body);
  try {
    const { employer, company, rating, comment } = req.body;
    
    // Add validation
    if (!employer || !company) {
      return res.status(400).json({
        success: false,
        message: 'Employer and company IDs are required'
      });
    }

    console.log('Creating feedback with:', {
      sender: req.user.userId,
      employer,
      company,
      rating,
      comment
    });

    const feedback = await Feedback.create({
      sender: req.user.userId,
      employer,
      company,
      rating,
      comment
    });

    console.log('Created feedback:', feedback);

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    console.error('Full error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get feedback for a specific employer
router.get('/employer/:employerId', async (req, res) => {
  try {
    console.log('Fetching feedback for employer:', req.params.employerId);
    const feedback = await Feedback.find({ 
      employer: req.params.employerId,
    })
      .populate({
        path: 'sender',
        select: 'firstName lastName role'
      })
      .sort('-createdAt')
      .limit(10);

    console.log('Found feedback:', feedback);

    res.json({
      success: true,
      total: feedback.length,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get feedback and ratings for a specific company
router.get('/company/:companyId', async (req, res) => {
  try {
    const companyId = req.params.companyId;
    console.log('Attempting to fetch feedback for company ID:', companyId);

    // First, try to find any feedback to verify the query
    const allFeedback = await Feedback.find({});
    console.log('All feedback in database:', allFeedback);

    // Now try to find feedback for specific company
    const feedbacks = await Feedback.find({
      company: companyId // Use the raw ID string
    })
    .populate('sender', 'firstName lastName')
    .sort({ createdAt: -1 });

    console.log('Found feedbacks for company:', feedbacks);

    // Log the query details
    console.log('Query details:', {
      searchingFor: companyId,
      foundCount: feedbacks.length,
      firstFeedback: feedbacks[0]
    });

    // Calculate ratings including pending feedback
    const validFeedbacks = feedbacks.filter(f => typeof f.rating === 'number');
    
    const ratingStats = {
      total: validFeedbacks.length,
      distribution: {
        5: validFeedbacks.filter(f => f.rating === 5).length,
        4: validFeedbacks.filter(f => f.rating === 4).length,
        3: validFeedbacks.filter(f => f.rating === 3).length,
        2: validFeedbacks.filter(f => f.rating === 2).length,
        1: validFeedbacks.filter(f => f.rating === 1).length,
      }
    };

    const averageRating = validFeedbacks.length > 0
      ? validFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / validFeedbacks.length
      : 0;

    console.log('Calculated stats:', {
      validFeedbacks: validFeedbacks.length,
      averageRating,
      distribution: ratingStats.distribution
    });

    const response = {
      success: true,
      data: feedbacks,
      stats: {
        averageRating,
        totalReviews: validFeedbacks.length,
        ratingDistribution: ratingStats.distribution
      }
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('Error in feedback route:', {
      error: error.message,
      stack: error.stack,
      companyId: req.params.companyId
    });
    
    res.status(500).json({
      success: false,
      message: 'Error fetching company feedback',
      error: error.message,
      details: {
        companyId: req.params.companyId,
        errorType: error.name
      }
    });
  }
});

// Add a new route to get ratings for multiple companies efficiently
router.get('/companies/ratings', async (req, res) => {
  try {
    const companyIds = req.query.ids ? req.query.ids.split(',') : [];
    
    const ratings = await Feedback.aggregate([
      {
        $match: {
          company: { 
            $in: companyIds.map(id => new mongoose.Types.ObjectId(id))
          },
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$company',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: ratings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching company ratings',
      error: error.message
    });
  }
});

export default router;