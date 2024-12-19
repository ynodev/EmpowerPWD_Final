import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Building2, X, Calendar, DollarSign, 
  Briefcase, CheckCircle2, Award, Users, GraduationCap,
  Globe, ChevronRight, ChevronLeft, Star, CheckCircle, Building
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import axiosInstance from '../../utils/axios';
import FeedbackForm from './FeedbackForm.js';
import { useNavigate } from 'react-router-dom';

const ReviewStats = ({ companyId }) => {
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    },
    reviews: []
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log('Fetching reviews for company:', companyId);
        const response = await axiosInstance.get(`/api/reviews/company/${companyId}`);
        console.log('Reviews Response:', response.data);

        if (response.data.success) {
          const { data: reviews, meta } = response.data;
          
          // Calculate distribution
          const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          reviews.forEach(review => {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
          });

          setReviewStats({
            averageRating: meta?.averageRating || 0,
            totalReviews: reviews.length,
            distribution,
            reviews: reviews.slice(0, 5) // Get latest 5 reviews
          });

          console.log('Processed review stats:', {
            averageRating: meta?.averageRating,
            totalReviews: reviews.length,
            distribution,
            reviews: reviews.slice(0, 5)
          });
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        console.error('Error details:', error.response?.data);
      }
    };

    if (companyId) {
      console.log('Initiating review fetch for companyId:', companyId);
      fetchReviews();
    }
  }, [companyId]);

  // Add debug log for current state
  useEffect(() => {
    console.log('Current reviewStats:', reviewStats);
  }, [reviewStats]);

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-4">Company Reviews</h3>
      
      {/* Average Rating */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {reviewStats.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                className={`w-4 h-4 ${
                  star <= reviewStats.averageRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = reviewStats.distribution[rating] || 0;
            const percentage = reviewStats.totalReviews > 0 
              ? (count / reviewStats.totalReviews) * 100 
              : 0;

            return (
              <div key={rating} className="flex items-center gap-2 text-sm mb-2">
                <div className="w-12 text-gray-600">{rating} stars</div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-8 text-gray-500">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reviews */}
      {reviewStats.reviews.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Reviews</h4>
          {reviewStats.reviews.map((review, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-600">{review.review}</p>
              {review.jobId && (
                <div className="mt-2 text-xs text-gray-500">
                  Position: {review.jobId.jobTitle}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const JobDetails = ({ job, isOpen, onClose, onApply }) => {
  const navigate = useNavigate();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const REVIEWS_TO_SHOW = 3;
  const [questionnaire, setQuestionnaire] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    console.log('Job Data:', job);
    console.log('Path to Company:', {
      employerId: job?.employersId,
      employer: job?.employer,
      companyInfo: job?.employer?.companyInfo,
      description: job?.employer?.companyInfo?.companyDescription,
      fullCompanyInfo: JSON.stringify(job?.employer?.companyInfo, null, 2)
    });
  }, [job]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        if (!job?.employersId) return;
        console.log('Fetching feedback for employer:', job.employersId);
        console.log('Full job data:', job);
        const response = await axiosInstance.get(`/api/feedback/employer/${job.employersId}`);
        console.log('Feedback Response:', response.data);
        if (response.data.data.length === 0) {
          console.log('No feedback found for this employer');
        }
        setFeedbacks(response.data.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        console.error('Error details:', error.response?.data);
      }
    };

    fetchFeedbacks();
  }, [job?.employersId]);

  useEffect(() => {
    console.log('Current feedbacks state:', feedbacks);
  }, [feedbacks]);

  useEffect(() => {
    console.log('Full Job Data:', job);
    console.log('Employer Data:', job?.employersId);
  }, [job]);

  useEffect(() => {
    if (job?.questioner) {
      setQuestionnaire(job.questioner);
    }
  }, [job]);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const response = await axiosInstance.get(`/api/applications/check/${job._id}`);
        setHasApplied(response.data.hasApplied);
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };

    if (job?._id) {
      checkApplicationStatus();
    }
  }, [job?._id]);

  const handleNextFeedback = () => {
    setCurrentFeedbackIndex((prev) => (prev + 1) % feedbacks.length);
  };

  const handlePrevFeedback = () => {
    setCurrentFeedbackIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
  };

  if (!isOpen) return null;

  const formatSalary = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleApply = async () => {
    try {
      if (job?.questioner && job.questioner.length > 0) {
        navigate(`/jobs/${job._id}/apply`, { 
          state: { 
            questionnaire: job.questioner,
            jobTitle: job.jobTitle,
            companyName: job?.employer?.companyInfo?.companyName 
          } 
        });
        return;
      }

      await axiosInstance.post(`/api/jobs/${job._id}/application`);
      onApply(job);
    } catch (error) {
      console.error('Error handling application:', error);
      onApply(job);
    }
  };

  const handleFeedbackClick = () => {
    setShowFeedbackForm(true);
  };

  return (
    <>
      {/* Overlay with blur effect */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
        onClick={onClose}
      />

      {/* Job Details Panel - Updated for mobile */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[600px] bg-white z-40 overflow-y-auto mt-[64px] border-l border-gray-100 sm:rounded-l-2xl">
        {/* Sticky Header - Updated for mobile */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-6 z-10">
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Company Logo - Updated with better placeholder */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 overflow-hidden border border-gray-100 rounded-xl flex-shrink-0">
              {job?.employer?.companyInfo?.companyLogo ? (
                <img 
                  src={`${process.env.REACT_APP_API_URL}${job.employer.companyInfo.companyLogo}`}
                  alt={job.employer?.companyInfo?.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50">
                  <Building className="w-6 h-6 text-gray-300" />
                  <span className="text-xs text-gray-400 mt-0.5">
                    {job.employer?.companyInfo?.companyName?.charAt(0) || 'C'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Basic Job Info */}
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 pr-8 sm:pr-0">{job?.jobTitle}</h1>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {job?.employer?.companyInfo?.companyName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-xs text-gray-600">{job?.jobLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-xs text-gray-600">
                    Posted {formatDistance(new Date(job?.createdAt), new Date(), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Updated padding for mobile */}
        <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6 bg-gray-50">
          {/* Requirements Section */}
          {job?.requirements && job.requirements.length > 0 && (
            <section className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></span>
                Requirements
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Experience Level</span>
                    <p className="text-sm font-medium text-gray-900">{job.experienceLevel}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Education Level</span>
                    <p className="text-sm font-medium text-gray-900">{job.educationLevel}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-2">Key Requirements</span>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="p-1 bg-green-50 rounded-full mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                        </div>
                        <span className="text-gray-700 text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Key Information Section - Updated grid for mobile */}
          <div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></span>
              Job Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {job?.salaryMin && job?.salaryMax && (
                <div className="bg-white p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={16} className="text-blue-500" />
                    <span className="text-xs font-medium text-gray-500">Salary Range</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}
                  </p>
                </div>
              )}

              {job?.employmentType && (
                <div className="bg-white p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase size={16} className="text-blue-500" />
                    <span className="text-xs font-medium text-gray-500">Employment Type</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{job.employmentType}</p>
                </div>
              )}

              <div className="bg-white p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-blue-500" />
                  <span className="text-xs font-medium text-gray-500">Work Setup</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{job.workSetup}</p>
              </div>

              <div className="bg-white p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="text-xs font-medium text-gray-500">Application Deadline</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(job.applicationDeadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Disability Types Section */}
          <section className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></span>
              Suitable for Persons with
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.disabilityTypes.map((type, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-xl"
                >
                  {type}
                </span>
              ))}
            </div>
          </section>

          {/* Job Description Section */}
          {job?.jobDescription && (
            <section className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Job Description</h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {job.jobDescription}
              </p>
            </section>
          )}

          {/* Company Information Section */}
          <div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-3">About the Company</h2>
            
            {/* Company Description */}
            {job?.employer?.companyInfo?.companyDescription && (
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {job.employer.companyInfo.companyDescription}
                </p>
              </div>
            )}

            {/* Company Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {job?.employer?.companyInfo?.companySize && (
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-1">Company Size</span>
                  <p className="text-sm font-medium text-gray-900">
                    {job.employer.companyInfo.companySize} employees
                  </p>
                </div>
              )}
              {job?.employer?.companyInfo?.industry && (
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-1">Industry</span>
                  <p className="text-sm font-medium text-gray-900">
                    {job.employer.companyInfo.industry.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Contact & Location */}
            <div className="space-y-4 mb-8">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Contact & Location</h3>
              
              {/* Website */}
              {job?.employer?.companyInfo?.website && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Globe size={16} className="text-gray-500" />
                  <a href={job.employer.companyInfo.website} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-blue-600 hover:underline text-sm">
                    {job.employer.companyInfo.website}
                  </a>
                </div>
              )}
              
              {/* Address */}
              {job?.employer?.companyInfo?.companyAddress && (
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-sm">
                    {`${job.employer.companyInfo.companyAddress.street}, 
                      ${job.employer.companyInfo.companyAddress.city}, 
                      ${job.employer.companyInfo.companyAddress.province}`}
                  </span>
                </div>
              )}
            </div>

            {/* Add ReviewStats here, after company info */}
            {job?.employer?.companyInfo?._id && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <ReviewStats companyId={job.employer.companyInfo._id} />
              </div>
            )}
          </div>

          {/* Reviews Section */}
          {feedbacks && feedbacks.length > 0 && (
            <div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"></span>
                  Company Reviews
                  <span className="text-sm font-normal text-gray-500">({feedbacks.length})</span>
                </h2>
                <button
                  onClick={handleFeedbackClick}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Write a Review
                </button>
              </div>

              {/* Average Rating */}
              <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {feedbacks.length > 0 
                      ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
                      : '0.0'
                    }
                  </div>
                  <div className="flex items-center gap-1 justify-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
                
                {/* Rating Distribution */}
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = feedbacks.filter(f => f.rating === rating).length;
                    const percentage = feedbacks.length > 0 
                      ? (count / feedbacks.length) * 100 
                      : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-2 text-sm">
                        <div className="w-12 text-gray-600">{rating} stars</div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-8 text-gray-500">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {job?.questioner && job.questioner.length > 0 && (
            <section className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></span>
                Application Questionnaire
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="p-1.5 bg-orange-50 rounded-lg">
                    <Users className="w-4 h-4 text-orange-500" />
                  </span>
                  <p className="text-sm text-gray-600">
                    This position requires completing {job.questioner.length} questions as part of the application process.
                  </p>
                </div>
                
                {/* Preview of questions */}
                <div className="space-y-3">
                  {job.questioner.slice(0, 2).map((question, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">Q{index + 1}:</span> {question}
                      </p>
                    </div>
                  ))}
                  {job.questioner.length > 2 && (
                    <p className="text-sm text-gray-500 italic">
                      +{job.questioner.length - 2} more questions
                    </p>
                  )}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    You'll be asked to answer these questions when you click the Apply button.
                  </p>
                </div>
              </div>
            </section>
          )}
              {/* Reviews List */}
              <div className="space-y-4">
                {feedbacks.length > 0 ? (
                  feedbacks
                    .slice(0, REVIEWS_TO_SHOW)
                    .map((feedback, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {feedback.sender?.firstName?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {feedback.sender?.firstName || 'Anonymous'} {feedback.sender?.lastName || 'User'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDistance(new Date(feedback.createdAt), new Date(), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(feedback.rating || 0)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 pl-10">{feedback.comment || 'No comment provided'}</p>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No reviews yet</p>
                    <button
                      onClick={handleFeedbackClick}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Be the first to review
                    </button>
                  </div>
                )}

                {/* Show More Button */}
                {feedbacks.length > REVIEWS_TO_SHOW && (
                  <div className="text-center pt-4 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/company/${job.employersId}/reviews`)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Show All {feedbacks.length} Reviews
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Application Questionnaire Section */}
         
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <div className="flex gap-3 max-w-lg mx-auto">
            {hasApplied ? (
              <div className="w-full">
                <button 
                  disabled
                  className="w-full bg-gray-100 text-gray-500 py-3 sm:py-2.5 text-sm font-medium rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Already Applied
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  View status in <a href="/my-application" className="text-blue-600 hover:underline">My Application</a>
                </p>
              </div>
            ) : (
              <button 
                onClick={handleApply}
                className="w-full bg-blue-600 text-white py-3 sm:py-2.5 text-sm font-medium hover:bg-blue-700 transition-all duration-200 rounded-xl"
              >
                Apply for this Position
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobDetails;
