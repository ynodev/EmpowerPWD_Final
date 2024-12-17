import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, Calendar, Filter, SortDesc, X, Plus, Video, Search } from 'lucide-react';
import axios from 'axios';
import NavSeeker from '../ui/navSeeker.js';


// Add helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const isToday = (date) => {
  const today = new Date();
  const compareDate = new Date(date);
  return (
    compareDate.getDate() === today.getDate() &&
    compareDate.getMonth() === today.getMonth() &&
    compareDate.getFullYear() === today.getFullYear()
  );
};

const formatInterviews = (interviews) => {
  if (!Array.isArray(interviews) || interviews.length === 0) {
    console.log('No interviews to format');
    return [];
  }

  // Group interviews by date
  const grouped = interviews.reduce((acc, interview) => {
    try {
      if (!interview.dateTime) {
        console.warn('Missing dateTime for interview:', interview._id);
        return acc;
      }

      const date = new Date(interview.dateTime);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date found:', interview.dateTime);
        return acc;
      }
      
      const dateKey = date.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: isToday(date) ? 'Today' : formatDate(date),
          fullDate: date.toLocaleDateString('en-US', { 
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          meetings: []
        };
      }

      acc[dateKey].meetings.push({
        id: interview._id,
        start: interview.startTime,
        end: interview.endTime,
        job: interview.job,
        employer: interview.employer,
        meetingLink: interview.meetingLink,
        notes: interview.notes,
        expanded: false,
      });

      return acc;
    } catch (error) {
      console.warn('Error processing interview:', error, interview);
      return acc;
    }
  }, {});

  // Convert to array and sort by date
  const sortedGroups = Object.values(grouped).sort((a, b) => {
    const dateA = new Date(a.fullDate);
    const dateB = new Date(b.fullDate);
    return dateA - dateB;
  });

  console.log('Sorted and grouped interviews:', sortedGroups);
  return sortedGroups;
};

const JobSeekerSchedule = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    companyName: '',
    dateRange: 'all', // 'today', 'week', 'month', 'all'
  });

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.error('No userId found in localStorage');
        setError('User ID not found. Please login again.');
        return;
      }

      console.log('Fetching interviews for userId:', userId);

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/interviews/jobseeker/${userId}`, {
        withCredentials: true
      });
      
      console.log('Full API response:', response.data);

      if (response.data.success) {
        if (!response.data.interviews || response.data.interviews.length === 0) {
          console.log('No interviews found in response');
          setInterviews([]);
          return;
        }

        const transformedInterviews = response.data.interviews.map(interview => {
          console.log('Processing interview:', interview);
          
          // Get employer details from the populated employerId
          const employerDetails = interview.employerId?.companyInfo || {};
          
          return {
            _id: interview._id,
            dateTime: interview.dateTime,
            employer: {
              companyName: interview.jobId?.employersId?.companyInfo?.companyName || 'N/A',
              location: interview.jobId?.jobLocation || 'N/A',
              email: interview.employerId?.email
            },
            job: {
              title: interview.jobId?.jobTitle || 'N/A',
            },
            meetingLink: interview.meetingLink || '#',
            notes: interview.notes || '',
            startTime: interview.startTime,
            endTime: interview.endTime,
            status: interview.status
          };
        });

        console.log('Transformed interviews:', transformedInterviews);
        
        const formattedInterviews = formatInterviews(transformedInterviews);
        console.log('Final formatted interviews:', formattedInterviews);
        
        setInterviews(formattedInterviews);
      } else {
        console.error('API request failed:', response.data);
        setError('Failed to fetch interviews');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterview = useCallback((dateIndex, meetingId) => {
    setInterviews(prev => prev.map((dateGroup, i) => {
      if (i === dateIndex) {
        return {
          ...dateGroup,
          meetings: dateGroup.meetings.map(meeting => {
            if (meeting.id === meetingId) {
              return { ...meeting, expanded: !meeting.expanded };
            }
            return meeting;
          })
        };
      }
      return dateGroup;
    }));
  }, []);

  // Filter interviews
  const getFilteredInterviews = useMemo(() => {
    return interviews.filter(dateGroup => {
      const date = new Date(dateGroup.fullDate);
      const today = new Date();
      
      // Date range filter
      if (filters.dateRange === 'today' && !isToday(date)) return false;
      if (filters.dateRange === 'week' && (date - today) > 7 * 24 * 60 * 60 * 1000) return false;
      if (filters.dateRange === 'month' && (date - today) > 30 * 24 * 60 * 60 * 1000) return false;

      // Company name filter
      if (filters.companyName) {
        return dateGroup.meetings.some(meeting => 
          meeting.employer.companyName.toLowerCase().includes(filters.companyName.toLowerCase())
        );
      }

      return true;
    });
  }, [interviews, filters.dateRange, filters.companyName]);

  return (
    <div>
      <NavSeeker />
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        {/* Header with improved mobile layout */}
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Interviews</h1>
          
          {/* Filters with better mobile layout */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search company..."
                value={filters.companyName}
                onChange={(e) => setFilters(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Tabs with better scrolling */}
        <div className="mb-6 border-b">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-3 relative whitespace-nowrap flex-shrink-0 ${
                activeTab === 'upcoming'
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming Interviews
              {activeTab === 'upcoming' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-3 relative whitespace-nowrap flex-shrink-0 ${
                activeTab === 'past'
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past Interviews
              {activeTab === 'past' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* Interview Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading interviews...</p>
          </div>
        ) : getFilteredInterviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700">No Interviews Scheduled</h3>
            <p className="text-sm text-gray-500 mt-2 px-4">
              {error || "You don't have any interviews scheduled for this period."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredInterviews.map((dateGroup, dateIndex) => (
              <div key={dateGroup.date} className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Date Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-transparent border-b">
                  <h3 className="font-medium text-gray-900">{dateGroup.date}</h3>
                </div>

                {/* Meetings List */}
                <div className="divide-y divide-gray-100">
                  {dateGroup.meetings.map((meeting) => (
                    <div key={meeting.id} className="p-4 hover:bg-gray-50/50">
                      <div className="space-y-4">
                        {/* Time and Title */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-900">
                              {meeting.startTime} - {meeting.endTime}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900">{meeting.job.title}</h4>
                          <p className="text-sm text-gray-500">
                            Interview with {meeting.employer.companyName}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleInterview(dateIndex, meeting.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                          >
                            {meeting.expanded ? <SortDesc className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                          </button>
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                          >
                            <Video className="w-4 h-4" />
                            <span>Join Meeting</span>
                          </a>
                        </div>

                        {/* Expanded Details */}
                        {meeting.expanded && (
                          <div className="mt-4 pl-4 border-l-2 border-blue-100 space-y-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-500 mb-1">Company Details</h5>
                              <p className="text-gray-900">{meeting.employer.companyName}</p>
                              <p className="text-sm text-gray-600">{meeting.employer.location}</p>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-500 mb-1">Meeting Link</h5>
                              <a
                                href={meeting.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 text-sm break-all"
                              >
                                {meeting.meetingLink}
                              </a>
                            </div>

                            {meeting.notes && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-500 mb-1">Notes</h5>
                                <p className="text-sm text-gray-600">{meeting.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-4 inset-x-4 sm:right-4 sm:left-auto sm:max-w-sm bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerSchedule; 