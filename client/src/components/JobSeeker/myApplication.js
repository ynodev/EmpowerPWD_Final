import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { MoreVertical, Calendar as CalendarIcon, ChevronDown, Filter, X, Clock, CheckCircle2, Eye, MessageCircle, Trash2 } from 'lucide-react';
import axios from 'axios';
import NavSeeker from '../ui/navSeeker';
import MessageModal from '../messages/MessageModal';
import ApplicationDetailsModal from '../ui/ApplicationDetailsModal';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';


const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const StatusIndicator = ({ status }) => {
  // Default status styles to handle undefined/unknown status
  const defaultStyle = {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-black',
    dot: 'bg-gray-400'
  };

  const statusStyles = {
    'pending': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      dot: 'bg-yellow-400'
    },
    'scheduled': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-400'
    },
    'rejected': {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-400'
    },
    'accepted': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-400'
    }
  };

  const style = statusStyles[status] || defaultStyle;
  const displayStatus = status || 'Unknown';

  return (
    <div className={`px-2.5 py-1 rounded-full border ${style.bg} ${style.border}`}>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        <span className={`text-xs font-medium ${style.text}`}>{displayStatus}</span>
      </div>
    </div>
  );
};

// CustomModal Component
const CancelModal = ({ isOpen, onClose, onConfirm, title, description }) => {
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [errors, setErrors] = useState({});

  const reasons = [
    'Found another job',
    'Changed my mind',
    'Location issues',
    'Salary expectations',
    'Company culture mismatch',
    'Other'
  ];

  const handleSubmit = () => {
    if (!reason) {
      setErrors({ reason: 'Please select a reason' });
      return;
    }
    onConfirm({ reason, additionalInfo });
    setReason('');
    setAdditionalInfo('');
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-[480px] shadow-lg">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-4 text-gray-600">{description}</p>
        
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Cancellation*
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full rounded-lg border ${errors.reason ? 'border-red-500' : 'border-gray-200'} shadow-sm p-2.5`}
            >
              <option value="">Select a reason</option>
              {reasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Information
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full rounded-lg border border-gray-200 shadow-sm p-2.5 h-24"
              placeholder="Please provide any additional details..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            No, keep it
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={handleSubmit}
          >
            Yes, cancel it
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicationCard = ({ application, onActionSelect, fetchApplications }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isCheckingReview, setIsCheckingReview] = useState(true);
  const [hasExistingReview, setHasExistingReview] = useState(
    application?.reviewDetails?.hasReviewed || false
  );

  // Add default values and null checks
  const {
    company = {
      name: 'Company Name Not Available',
      logo: null,
      website: '',
      description: '',
      industry: ''
    },
    job = {
      title: 'Position Not Available',
      location: 'Location Not Available',
      employmentType: 'Not Specified',
      employerId: '',
      salary: { min: 0, max: 0 }
    },
    status = 'Pending',
    applicationId
  } = application || {};

  // Update the useEffect for review check
  useEffect(() => {
    const checkExistingReview = async () => {
      setIsCheckingReview(true);
      try {
        // If we already know there's a review from the application data, skip the check
        if (application?.reviewDetails?.hasReviewed) {
          setHasExistingReview(true);
          setIsCheckingReview(false);
          return;
        }

        const employerId = application.job?.employerId || application.employer?._id;
        
        if (!application.applicationId || !employerId) {
          console.log('Missing required IDs');
          setIsCheckingReview(false);
          return;
        }

        const response = await axios.get(
          `/api/reviews/check/${application.applicationId}/${employerId}`,
          { withCredentials: true }
        );
        
        setHasExistingReview(response.data.exists && response.data.matchesBoth);
      } catch (error) {
        console.error('Error checking review:', error);
      } finally {
        setIsCheckingReview(false);
      }
    };

    // Only check for review if application is in a reviewable state
    const reviewableStatuses = ['completed', 'accepted'];
    if (reviewableStatuses.includes(status.toLowerCase())) {
      checkExistingReview();
    } else {
      setIsCheckingReview(false);
    }
  }, [application, status]);

  // Update the canShowReviewButton function
  const canShowReviewButton = () => {
    if (isCheckingReview) return false;
    
    const reviewableStatuses = ['completed', 'accepted'];
    return reviewableStatuses.includes(status.toLowerCase()) && 
           !application?.reviewDetails?.hasReviewed && 
           !hasExistingReview;
  };

  // Add handleAction function
  const handleAction = async (action, applicationId, data = {}) => {
    try {
      switch (action) {
        case 'cancel':
          const response = await axios.put(`/api/applications/cancel/${applicationId}`, {
            reason: data.reason,
            additionalInfo: data.additionalInfo
          }, {
            withCredentials: true
          });
          
          if (response.data.success) {
            alert('Application cancelled successfully');
            fetchApplications();
          } else {
            alert(response.data.message || 'Failed to cancel application');
          }
          break;
        case 'view':
          onActionSelect('view', applicationId);
          break;
        case 'schedule':
          onActionSelect('schedule', applicationId);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling action:', error);
      alert(
        error.response?.data?.message || 
        'Failed to cancel application. Please try again.'
      );
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-visible hover:shadow-md transition-shadow relative border border-gray-200">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Logo and Mobile Actions Section */}
            <div className="flex justify-between items-start lg:block">
              {/* Company Logo */}
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center">
                {company.logo ? (
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <span className="text-2xl font-medium text-gray-500">
                    {company.name ? company.name.charAt(0) : 'N/A'}
                  </span>
                )}
              </div>

              {/* Mobile Actions */}
              <div className="lg:hidden relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <MoreVertical size={20} className="text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-20 border border-gray-200"
                    >
                      <button 
                        onClick={() => {
                          onActionSelect('view', applicationId);
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button 
                        onClick={() => {
                          setShowMessageModal(true);
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <MessageCircle size={16} />
                        Message Recruiter
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <X size={16} />
                        Cancel Application
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Job Info */}
            <div className="flex-grow">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {job.title}
                  </h3>
                  <StatusIndicator status={status} />
                </div>
              </div>
              
              <p className="text-gray-600 mb-2">{company.name}</p>
              
              <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.employmentType}</span>
                {(job.salary.min > 0 || job.salary.max > 0) && (
                  <>
                    <span>•</span>
                    <span>
                      ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex lg:hidden gap-2 mt-4">
                {status === 'interview' && (
                  <button
                    onClick={() => onActionSelect('schedule', applicationId)}
                    className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    Schedule Interview
                  </button>
                )}
                
                {!isCheckingReview && canShowReviewButton() && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {status === 'interview' && (
                <button
                  onClick={() => onActionSelect('schedule', applicationId)}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors whitespace-nowrap"
                >
                  Schedule Interview
                </button>
              )}
              
              {!isCheckingReview && canShowReviewButton() && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  Review
                </button>
              )}

              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <MoreVertical size={20} className="text-gray-400" />
                </button>
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-20 border border-gray-200"
                    >
                      <button 
                        onClick={() => {
                          onActionSelect('view', applicationId);
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button 
                        onClick={() => {
                          setShowMessageModal(true);
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <MessageCircle size={16} />
                        Message Recruiter
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <X size={16} />
                        Cancel Application
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CancelModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={(data) => {
          handleAction('cancel', applicationId, data);
          setShowDeleteModal(false);
        }}
        title="Cancel Application"
        description={`Are you sure you want to cancel your application for ${job.title} at ${company.name}?`}
      />

      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        employerId={job.employerId}
        jobTitle={job.title}
        companyName={company.name}
      />

      {/* Add Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Review {company.name}</h2>
            <ReviewForm 
              applicationId={application.applicationId}
              jobId={job.id}
              companyId={job.employerId}
              onClose={() => setShowReviewModal(false)}
              onSubmitSuccess={() => {
                setShowReviewModal(false);
                fetchApplications();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Add the ReviewForm component
const ReviewForm = ({ applicationId, jobId, companyId, onClose, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/reviews/company', {
        applicationId,
        jobId,
        companyId,
        rating,
        review
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert('Review submitted successfully!');
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          required
          placeholder="Share your experience working with this company..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !rating || !review.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

const fetchRecurringSchedules = async (employerId) => {
  try {
    console.log('Fetching recurring schedules for employer:', employerId);
    const response = await axios.get(`/api/schedule/recurring/${employerId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch recurring schedules');
    }

    console.log('Recurring schedules response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching recurring schedules:', error);
    throw error;
  }
};

const MyApplications = () => {
  const { user: currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState(null);
  const [selectedViewDate, setSelectedViewDate] = useState(null);
  const [availableDates, setAvailableDates] = useState(new Set());
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [dailySlots, setDailySlots] = useState([]);
  const [schedulingStep, setSchedulingStep] = useState(1);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/applications/jobseeker/applications', {
        withCredentials: true
      });

      if (response.data.success) {
        const formattedApplications = response.data.data.map(app => ({
          applicationId: app._id,
          status: app.status || 'Pending',
          appliedAt: new Date(app.createdAt),
          job: {
            id: app.jobId?._id,
            title: app.jobId?.jobTitle || 'No Title',
            location: app.jobId?.jobLocation || 'No Location',
            employmentType: app.jobId?.employmentType || 'Not Specified',
            employerId: app.jobId?.employersId,
            salary: {
              min: app.jobId?.salaryMin || 0,
              max: app.jobId?.salaryMax || 0
            }
          },
          company: app.jobId?.company || {
            name: 'Company Name Not Available',
            logo: null,
            website: '',
            description: '',
            industry: ''
          },
          basicInfo: app.basicInfo || {},
          workHistory: app.workHistory || [],
          jobPreferences: app.jobPreferences || {},
          documents: app.documents || {}
        }));

        console.log('Formatted applications:', formattedApplications);
        setApplications(formattedApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  

  const handleSort = (applications) => {
    return [...applications].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.appliedAt) - new Date(b.appliedAt);
          break;
        case 'company':
          comparison = a.company.name.localeCompare(b.company.name);
          break;
        case 'title':
          comparison = a.job.title.localeCompare(b.job.title);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const handleFilter = (applications) => {
    return applications.filter(app => {
      // Add null checks and data transformation
      const jobTitle = app.jobId?.jobTitle || '';
      const companyName = app.jobId?.employersId?.companyInfo?.companyName || '';
      
      const matchesSearch = searchTerm === '' || (
        jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  };

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleDateClick = (date, isCurrentMonth) => {
      if (!isCurrentMonth) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) return;
      
      try {
        const dateString = date.toISOString().split('T')[0];
        console.log('Clicked date:', dateString);
        console.log('Available dates:', Array.from(availableDates));

        if (availableDates.has(dateString)) {
          setSelectedViewDate(date);
          const slotsForDay = availableSlots.filter(slot => slot.date === dateString);
          console.log('Found slots for day:', slotsForDay);
          setDailySlots(slotsForDay);
          setSchedulingStep(2);
        }
      } catch (error) {
        console.error('Error handling date click:', error);
      }
    };

    // Update the hasAvailableSlots function
    const hasAvailableSlots = (date) => {
      const dateString = date.toISOString().split('T')[0];
      return availableDates.has(dateString);
    };

    return (
      <div className="p-2 md:p-3">
        <div className="flex justify-between items-center mb-2 md:mb-3 px-2">
          <button 
            onClick={() => setSelectedDate(new Date(year, month - 1))} 
            className="text-gray-600 hover:text-gray-800 p-1 md:p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            ←
          </button>
          <h3 className="text-xs md:text-sm font-medium">
            {monthNames[month]} {year}
          </h3>
          <button 
            onClick={() => setSelectedDate(new Date(year, month + 1))} 
            className="text-gray-600 hover:text-gray-800 p-1 md:p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            →
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => (
            <div key={`header-${day}`} className="text-center text-gray-500 font-medium p-1 text-[10px] md:text-xs">
              {day}
            </div>
          ))}
          {Array.from({ length: 42 }).map((_, i) => {
            const dayNumber = i - getFirstDayOfMonth(year, month) + 1;
            const isCurrentMonth = dayNumber > 0 && dayNumber <= getDaysInMonth(year, month);
            const date = new Date(year, month, dayNumber);
            const isToday = date.toDateString() === new Date().toDateString();
            const hasSlots = isCurrentMonth && hasAvailableSlots(date);
            const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
            
            return (
              <button
                key={`day-${i}`}
                onClick={() => handleDateClick(date, isCurrentMonth)}
                disabled={!isCurrentMonth || isPastDate}
                className={`
                  h-6 md:h-8 flex items-center justify-center text-[10px] md:text-xs rounded-lg
                  ${isCurrentMonth ? 'cursor-pointer' : 'text-gray-300 cursor-default'}
                  ${hasSlots ? 'bg-blue-100 text-blue-600 border-2 border-blue-500 hover:bg-blue-200' : 
                    isCurrentMonth ? 'hover:bg-gray-100' : ''}
                  ${isToday ? 'font-bold' : ''}
                  ${isPastDate ? 'opacity-50 cursor-not-allowed' : ''}
                  transition-all duration-200
                `}
              >
                {isCurrentMonth ? dayNumber : ''}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handleAction = async (action, applicationId, data = {}) => {
    try {
      switch (action) {
        case 'cancel':
          const response = await axios.put(`/api/applications/cancel/${applicationId}`, {
            reason: data.reason,
            additionalInfo: data.additionalInfo
          }, {
            withCredentials: true
          });
          
          if (response.data.success) {
            alert('Application cancelled successfully');
            fetchApplications();
          } else {
            alert(response.data.message || 'Failed to cancel application');
          }
          break;
        case 'view':
          const viewApp = applications.find(app => app.applicationId === applicationId);
          setSelectedApplication(viewApp);
          break;
        
        case 'message':
          // Implement message recruiter logic
          break;

        case 'schedule':
          try {
            const scheduleApp = applications.find(app => app.applicationId === applicationId);
            console.log('Full application object:', scheduleApp);
            
            const employerId = scheduleApp?.job?.employerId;
            console.log('Extracted employerId:', employerId);
            
            if (!employerId) {
              console.error('Missing employer ID in application:', scheduleApp);
              throw new Error('Cannot find employer information');
            }

            // Log the full application data
            console.log('Application data:', {
              applicationId: scheduleApp.applicationId,
              employerId: employerId,
              jobId: scheduleApp.job.id,
              company: scheduleApp.company,
              job: scheduleApp.job
            });

            setSelectedApplication(scheduleApp);
            await fetchAvailableSlots(employerId);
            setShowScheduleModal(true);
            setSchedulingStep(1);
          } catch (error) {
            console.error('Error preparing schedule:', error);
            alert('Failed to load schedule. Please try again.');
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error handling action:', error);
      alert(
        error.response?.data?.message || 
        'Failed to cancel application. Please try again.'
      );
    }
  };

  // Update the fetchAvailableSlots function
  const fetchAvailableSlots = async (employerId) => {
    try {
      setLoading(true);
      console.log('Fetching slots for employer:', employerId);

      // Fetch schedules and existing interviews in parallel
      const [specificResponse, recurringSchedules, existingInterviews] = await Promise.all([
        axios.get(`/api/schedule/available/${employerId}`),
        fetchRecurringSchedules(employerId),
        axios.get(`/api/interviews/slots/${employerId}`, { withCredentials: true })
      ]);

      if (!specificResponse.data.success) {
        throw new Error(specificResponse.data.message || 'Failed to fetch slots');
      }

      const { specificSchedules = [] } = specificResponse.data.data;
      const availableDatesSet = new Set();
      const allSlots = [];
      
      // Create a map for quick lookup of booked slots
      const bookedSlots = new Map();
      if (existingInterviews.data?.data) {
        existingInterviews.data.data.forEach(slot => {
          const dateKey = slot.date;
          if (!bookedSlots.has(dateKey)) {
            bookedSlots.set(dateKey, new Set());
          }
          bookedSlots.get(dateKey).add(`${slot.startTime}-${slot.endTime}`);
        });
      }

      // Helper function to check if a slot is booked
      const isSlotBooked = (date, startTime, endTime) => {
        const dateBookings = bookedSlots.get(date);
        return dateBookings ? dateBookings.has(`${startTime}-${endTime}`) : false;
      };

      // Process specific schedules
      specificSchedules.forEach(schedule => {
        if (!schedule.date || !schedule.timeSlots) return;
        
        const dateString = new Date(schedule.date).toISOString().split('T')[0];
        let hasAvailableSlot = false;

        schedule.timeSlots.forEach(slot => {
          const isBooked = isSlotBooked(dateString, slot.start, slot.end);
          
          allSlots.push({
            _id: slot._id,
            scheduleId: schedule._id,
            date: dateString,
            start: slot.start,
            end: slot.end,
            formattedTime: `${slot.start} - ${slot.end}`,
            type: 'specific',
            isBooked: isBooked || slot.isBooked
          });

          if (!isBooked && !slot.isBooked) {
            hasAvailableSlot = true;
          }
        });

        if (hasAvailableSlot) {
          availableDatesSet.add(dateString);
        }
      });

      // Process recurring schedules
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      recurringSchedules.forEach(schedule => {
        if (!schedule.recurringDays?.length) return;

        schedule.recurringDays.forEach(day => {
          if (day.status === 'active' && day.slots?.length) {
            let currentDate = new Date(today);

            while (currentDate <= endDate) {
              const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
              
              if (dayName === day.day.toLowerCase()) {
                const dateString = currentDate.toISOString().split('T')[0];
                let hasAvailableSlot = false;

                day.slots.forEach(slot => {
                  const isBooked = isSlotBooked(dateString, slot.start, slot.end);

                  allSlots.push({
                    _id: slot._id,
                    scheduleId: schedule._id,
                    date: dateString,
                    start: slot.start,
                    end: slot.end,
                    formattedTime: `${slot.start} - ${slot.end}`,
                    type: 'recurring',
                    recurringDay: day.day,
                    isBooked: isBooked || slot.isBooked
                  });

                  if (!isBooked && !slot.isBooked) {
                    hasAvailableSlot = true;
                  }
                });

                if (hasAvailableSlot) {
                  availableDatesSet.add(dateString);
                }
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        });
      });

      setAvailableDates(availableDatesSet);
      setAvailableSlots(allSlots);

    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Failed to fetch available slots. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Update the renderTimeSlots function with more logging
  const renderTimeSlots = () => {
    if (!selectedViewDate) {
      return null;
    }

    const dateString = selectedViewDate.toISOString().split('T')[0];
    const slotsForDate = availableSlots.filter(slot => slot.date === dateString);

    // Sort slots by start time
    slotsForDate.sort((a, b) => {
      const timeA = new Date(`2000/01/01 ${a.start}`).getTime();
      const timeB = new Date(`2000/01/01 ${b.start}`).getTime();
      return timeA - timeB;
    });

    if (!slotsForDate || slotsForDate.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No available time slots for this date
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slotsForDate.map((slot) => {
          const isAvailable = !slot.isBooked;
          
          return (
            <button
              key={`${slot._id}-${slot.start}-${slot.end}`}
              onClick={() => {
                if (isAvailable) {
                  setSelectedSlot({
                    _id: slot._id,
                    start: slot.start,
                    end: slot.end,
                    scheduleId: slot.scheduleId,
                    type: slot.type
                  });
                }
              }}
              disabled={!isAvailable}
              className={`
                p-2 text-xs md:text-sm rounded-lg border transition-colors
                ${selectedSlot?._id === slot._id
                  ? 'bg-blue-500 text-white border-blue-500'
                  : isAvailable
                    ? 'hover:bg-gray-50 border-gray-200'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }
              `}
            >
              {slot.formattedTime}
              {!isAvailable && (
                <span className="block text-[10px] text-red-400">Booked</span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Handle schedule button click
  const handleScheduleClick = async (application) => {
    setSelectedApplication(application);
    await fetchAvailableSlots(application.employerId);
    setShowScheduleModal(true);
  };

  // Update the handleScheduleSubmit function
  const handleScheduleSubmit = async () => {
    try {
      setLoading(true);
      
      if (!selectedSlot || !selectedViewDate || !selectedApplication) {
        throw new Error('Missing required scheduling information');
      }

      // Check if slot is still available
      const checkAvailability = await axios.get('/api/interviews/check-slot', {
        params: {
          date: selectedViewDate.toISOString(),
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          employerId: selectedApplication.job.employerId
        },
        withCredentials: true
      });

      if (!checkAvailability.data.isAvailable) {
        alert('This time slot is no longer available. Please select another slot.');
        // Refresh available slots
        await fetchAvailableSlots(selectedApplication.job.employerId);
        return;
      }

      const scheduleData = {
        dateTime: selectedViewDate.toISOString(),
        startTime: selectedSlot.start,
        endTime: selectedSlot.end
      };

      const response = await axios.patch(
        `/api/interviews/application/${selectedApplication.applicationId}`, 
        scheduleData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setShowScheduleModal(false);
        setSchedulingStep(1);
        setSelectedSlot(null);
        setSelectedViewDate(null);
        alert('Interview scheduled successfully!');
        await fetchApplications();
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle interview details
  const fetchInterviewDetails = async (applicationId) => {
    try {
      const response = await axios.get(`/api/interviews/application/${applicationId}`, {
        withCredentials: true
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching interview details:', error);
      return null;
    }
  };

  // Add this to handle application details view
  const handleViewDetails = async (applicationId) => {
    try {
      const response = await axios.get(`/api/applications/${applicationId}/details`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // If there's an interview scheduled, fetch those details too
        if (response.data.data.status === 'Interview Scheduled') {
          const interviewDetails = await fetchInterviewDetails(applicationId);
          setSelectedApplication({
            ...response.data.data,
            interviewDetails
          });
        } else {
          setSelectedApplication(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      alert('Failed to load application details');
    }
  };

  // Update the MeetingSetup component with null checks and loading states
  const MeetingSetup = ({ interview, selectedSlot, selectedViewDate }) => {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Meeting Details</h3>
          
          {/* Date and Time Details */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Date</p>
                <p className="text-sm text-gray-600">
                  {selectedViewDate?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Time Slot */}
            <div className="flex items-start space-x-2">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Time</p>
                <p className="text-sm text-gray-600">
                  {selectedSlot ? (
                    `${selectedSlot.start} - ${selectedSlot.end}`
                  ) : (
                    'No time selected'
                  )}
                </p>
              </div>
            </div>

            {/* Interview Details */}
            {interview && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Interview Information</h4>
                <p className="text-sm text-gray-600">
                  {interview.meetingLink ? (
                    <a 
                      href={interview.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Join Meeting Link
                    </a>
                  ) : (
                    'Meeting link will be provided soon'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add this before the return statement in your component
  const moveToStep3 = async () => {
    try {
      const interviewDetails = await fetchInterviewDetails(selectedApplication.applicationId);
      setSelectedInterview(interviewDetails);
      setSchedulingStep(3);
    } catch (error) {
      console.error('Error fetching interview details:', error);
      alert('Failed to load interview details. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavSeeker/>
      <hr className="border-t border-gray-300 mt-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-poppins">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">My Applications</h1>
          <p className="text-gray-600">Track and manage your job applications</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Applications',
              value: applications.length,
              icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
              color: 'blue'
            },
            {
              label: 'Pending',
              value: applications.filter(app => app.status.toLowerCase() === 'pending').length,
              icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
              color: 'yellow'
            },
            {
              label: 'Interviews',
              value: applications.filter(app => app.status.toLowerCase() === 'interview scheduled').length,
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              color: 'emerald'
            },
            {
              label: 'Completed',
              value: applications.filter(app => app.status.toLowerCase() === 'completed').length,
              icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
              color: 'blue'
            }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center mb-4`}>
                <svg 
                  className={`w-6 h-6 text-${stat.color}-600`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Search and Action Buttons */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search applications..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Sort and Filter Buttons */}
              <div className="flex gap-3">
                {/* Sort Button */}
                <div className="relative flex-1 lg:flex-none">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="w-full lg:w-auto px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <span>Sort</span>
                  </button>

                  {showSortMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSortMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-20 border border-gray-200">
                        <button
                          onClick={() => {
                            setSortBy('date');
                            setShowSortMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Date Applied
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('company');
                            setShowSortMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Company Name
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('title');
                            setShowSortMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Job Title
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Filter Button */}
                <div className="relative flex-1 lg:flex-none">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full lg:w-auto px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <Filter size={20} />
                    <span>Filter</span>
                  </button>

                  {showFilters && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowFilters(false)}
                      />
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg p-4 z-20 border border-gray-200">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/50"
                            >
                              <option value="All">All Status</option>
                              <option value="Pending">Pending</option>
                              <option value="Interview Scheduled">Interview Scheduled</option>
                              <option value="Completed">Completed</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>

                          {/* Add any additional filters here */}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-gray-500 border border-gray-200">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-gray-500 border border-gray-200">
              No applications found.
            </div>
          ) : (
            handleSort(handleFilter(applications)).map((application) => (
              <ApplicationCard
                key={application.applicationId}
                application={application}
                onActionSelect={handleAction}
                fetchApplications={fetchApplications}
              />
            ))
          )}
        </div>
      </div>

      <ApplicationDetailsModal
        isOpen={selectedApplication !== null}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
      />

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95%] md:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Schedule Interview</h2>
              <button 
                onClick={() => {
                  setShowScheduleModal(false);
                  setSchedulingStep(1);
                  setSelectedViewDate(null);
                  setSelectedSlot(null);
                  setMeetingDetails(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mb-4 md:mb-6">
              <div className="flex justify-between">
                {['Select Date', 'Choose Time', 'Setup Meeting'].map((step, index) => (
                  <div 
                    key={step} 
                    className={`flex items-center ${index < 2 ? 'flex-1' : ''}`}
                  >
                    <div className={`
                      w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm
                      ${schedulingStep > index + 1 ? 'bg-green-500 text-white' : 
                        schedulingStep === index + 1 ? 'bg-blue-500 text-white' : 
                        'bg-gray-200 text-gray-600'}
                    `}>
                      {schedulingStep > index + 1 ? '✓' : index + 1}
                    </div>
                    {index < 2 && (
                      <div className={`flex-1 h-1 mx-1 md:mx-2 ${
                        schedulingStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {['Select Date', 'Choose Time', 'Setup Meeting'].map((step, index) => (
                  <div key={step} className="text-[10px] md:text-xs text-gray-500 text-center flex-1">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            {schedulingStep === 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
                {renderCalendar()}
              </div>
            )}

            {schedulingStep === 2 && selectedViewDate && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Available times for {selectedViewDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                {renderTimeSlots()}
              </div>
            )}

            {schedulingStep === 3 && (
              <div className="mt-4">
                <MeetingSetup 
                  interview={selectedInterview} 
                  selectedSlot={selectedSlot}
                  selectedViewDate={selectedViewDate}
                />
                {selectedInterview && (
                  <button
                    onClick={handleScheduleSubmit}
                    disabled={loading}
                    className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {loading ? 'Confirming Schedule...' : 'Confirm Schedule'}
                  </button>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 md:mt-6 pt-4 border-t">
              {schedulingStep > 1 && (
                <button
                  onClick={() => setSchedulingStep(prev => prev - 1)}
                  className="px-3 py-1.5 md:px-4 md:py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Back
                </button>
              )}
              {schedulingStep < 3 && selectedViewDate && (schedulingStep === 1 || selectedSlot) && (
                <button
                  onClick={() => schedulingStep === 2 ? moveToStep3() : setSchedulingStep(prev => prev + 1)}
                  className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Next
                </button>
              )}
              {schedulingStep === 3 && meetingDetails && (
                <button
                  onClick={handleScheduleSubmit}
                  disabled={loading}
                  className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {loading ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
                  