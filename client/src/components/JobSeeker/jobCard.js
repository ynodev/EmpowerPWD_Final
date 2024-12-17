import React from 'react';
import { formatDistance } from 'date-fns';
import { useState, useEffect } from 'react';
import { MapPin, Building2, Clock, Briefcase, BookmarkPlus, BookmarkCheck, Pin, Star } from 'lucide-react';
import axiosInstance from '../../utils/axios';


const JobCard = ({ job, onOpenDetails }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedJobId, setSavedJobId] = useState(null);
  const [hasViewed, setHasViewed] = useState(false);
  const [companyRating, setCompanyRating] = useState(null);

  const companyName = job.employer?.companyInfo?.companyName || 'Unknown Company';
  const companyLogo = job.employer?.companyInfo?.companyLogo;

  // Track view when card is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !hasViewed) {
          try {
            await axiosInstance.post(`/api/jobs/${job._id}/view`);
            setHasViewed(true);
          } catch (error) {
            console.error('Error tracking view:', error);
          }
        }
      },
      { threshold: 0.5 } // Card must be 50% visible
    );

    const cardElement = document.getElementById(`job-card-${job._id}`);
    if (cardElement) {
      observer.observe(cardElement);
    }

    return () => observer.disconnect();
  }, [job._id, hasViewed]);

  // Track click when details are opened
  const handleOpenDetails = async () => {
    try {
      await axiosInstance.post(`/api/jobs/${job._id}/click`);
      onOpenDetails(job);
    } catch (error) {
      console.error('Error tracking click:', error);
      onOpenDetails(job); // Still open details even if tracking fails
    }
  };

  // Check if job is saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const response = await axiosInstance.get(`/api/saved-jobs/check/${job._id}`);
        setIsSaved(response.data.isSaved);
        if (response.data.isSaved) {
          setSavedJobId(response.data.savedJobId);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };
    checkSavedStatus();
  }, [job._id]);

  // Format salary to PHP with proper formatting
  const formatSalary = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSaveJob = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');

      if (isSaved && savedJobId) {
        // Use axiosInstance for delete request
        await axiosInstance.delete(`/api/saved-jobs/${savedJobId}`);
        setIsSaved(false);
        setSavedJobId(null);
      } else {
        // Use axiosInstance for post request
        const response = await axiosInstance.post('/api/saved-jobs', { 
          jobId: job._id,
          userId: userId
        });
        setIsSaved(true);
        setSavedJobId(response.data._id);
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this useEffect to fetch company rating
  useEffect(() => {
    const fetchCompanyRating = async () => {
      try {
        if (job.employer?.companyInfo?._id) {
          const response = await axiosInstance.get(`/api/reviews/company/${job.employer.companyInfo._id}/stats`);
          if (response.data.success) {
            setCompanyRating(response.data.data.averageRating);
          }
        }
      } catch (error) {
        console.error('Error fetching company rating:', error);
      }
    };

    fetchCompanyRating();
  }, [job.employer?.companyInfo?._id]);

  return (
    <div 
      id={`job-card-${job._id}`}
      className="bg-white p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 font-poppins"
    >
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Company Logo */}
        <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
          {companyLogo ? (
            <img 
              src={`http://localhost:5001${companyLogo}`}
              alt={companyName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-2xl font-bold text-gray-300">
              {companyName.charAt(0)}
            </div>
          )}
        </div>

        {/* Job Details */}
        <div className="flex-1">
          {/* Title and Posted Date Row */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-2 mb-2">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              {job.jobTitle}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={16} className="text-gray-400" />
              <span>{formatDistance(new Date(job.createdAt), new Date(), { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 size={18} className="text-gray-400 flex-shrink-0" />
              <span className="font-medium">{companyName}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={18} className="text-gray-400 flex-shrink-0" />
              <span>{job.jobLocation}</span>
            </div>
          </div>

          {/* Brief Description */}
          <p className="text-gray-600 line-clamp-2 min-h-[3rem] mb-4">
            {job.jobDescription}
          </p>

          {/* Footer: Job Type, Salary, and Actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-blue-500" />
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  {job.employmentType}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-medium">
                  {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)} /year
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <button
                onClick={handleSaveJob}
                disabled={isLoading}
                className={`p-2 rounded-lg border transition-colors ${
                  isSaved 
                    ? 'bg-blue-50 border-blue-200 rounded-xl text-blue-600 hover:bg-blue-100'
                    : 'border-gray-200 text-gray-400 hover:bg-gray-50 rounded-xl'
                }`}
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                ) : (
                  isSaved ? <BookmarkCheck size={20} /> : <BookmarkPlus size={20} />
                )}
              </button>
              <button
                onClick={handleOpenDetails}
                className="flex-1 lg:flex-none px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;



