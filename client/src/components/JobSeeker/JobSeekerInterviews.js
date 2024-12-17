import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Video, Plus, SortDesc, X } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import NavSeeker from '../ui/navSeeker.js';

// Helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
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

  const now = new Date();

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
      
      // Check if interview is past
      const isPast = date < now || interview.status === 'completed';
      const groupKey = isPast ? 'past' : 'upcoming';

      if (!acc[groupKey]) {
        acc[groupKey] = {};
      }
      
      if (!acc[groupKey][dateKey]) {
        acc[groupKey][dateKey] = {
          date: isToday(date) ? 'Today' : formatDate(date),
          fullDate: date.toLocaleDateString('en-US', { 
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          meetings: []
        };
      }

      acc[groupKey][dateKey].meetings.push({
        id: interview._id,
        start: interview.startTime,
        end: interview.endTime,
        job: {
          title: interview.jobId?.jobTitle || interview.job?.title || 'N/A'
        },
        employer: {
          companyName: interview.company?.name || 'N/A',
          location: interview.jobId?.jobLocation || 'N/A'
        },
        meetingLink: interview.meetingLink,
        notes: interview.notes,
        status: interview.status || 'scheduled',
        expanded: false,
        isPast: isPast
      });

      return acc;
    } catch (error) {
      console.warn('Error processing interview:', error, interview);
      return acc;
    }
  }, { upcoming: {}, past: {} });

  // Sort and format the final arrays
  const formatGroup = (group) => {
    return Object.values(group).sort((a, b) => {
      const dateA = new Date(a.fullDate);
      const dateB = new Date(b.fullDate);
      return dateA - dateB;
    });
  };

  return {
    upcoming: formatGroup(grouped.upcoming),
    past: formatGroup(grouped.past)
  };
};

// Add this function at the top level
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

const JobSeekerInterviews = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [interviews, setInterviews] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInterviews();
  }, [activeTab]);

  const fetchInterviews = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User ID not found');

      const response = await axios.get(`/api/interviews/jobseeker/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const formattedInterviews = formatInterviews(response.data.interviews);
      setInterviews(formattedInterviews);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleInterview = (dateIndex, meetingId) => {
    setInterviews(prev => {
      // Create a deep copy of the interviews object
      const newInterviews = { ...prev };
      
      // Get the current active tab's interviews
      const currentTabInterviews = [...newInterviews[activeTab]];
      
      // Update the specific date group
      if (currentTabInterviews[dateIndex]) {
        currentTabInterviews[dateIndex] = {
          ...currentTabInterviews[dateIndex],
          meetings: currentTabInterviews[dateIndex].meetings.map(meeting => {
            if (meeting.id === meetingId) {
              return { ...meeting, expanded: !meeting.expanded };
            }
            return meeting;
          })
        };
      }
      
      // Update the interviews for the current tab
      newInterviews[activeTab] = currentTabInterviews;
      
      return newInterviews;
    });
  };

  const InterviewList = React.memo(({ interviews, activeTab }) => (
    <div className="space-y-4">
      {interviews[activeTab]?.map((dateGroup, dateIndex) => (
        <div key={dateGroup.date} className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Date Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-transparent border-b">
            <h3 className="font-medium text-gray-900">{dateGroup.date}</h3>
          </div>

          {/* Meetings List */}
          <div className="divide-y divide-gray-100">
            {dateGroup.meetings.map((meeting) => (
              <div key={meeting.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left Side - Meeting Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Clock size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="font-medium">
                        {meeting.start} - {meeting.end}
                      </span>
                    </div>

                    <h4 className="font-medium text-gray-900">
    Job Interview for "{meeting.job.title}"
</h4>                   

                    {meeting.status === 'completed' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                        Completed
                      </span>
                    )}

                    {/* Expanded Content */}
                    {meeting.expanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                        {meeting.employer.location !== 'N/A' && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-1">Location</h5>
                            <p className="text-sm text-gray-600">{meeting.employer.location}</p>
                          </div>
                        )}

                        {meeting.notes && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-1">Meeting Notes</h5>
                            <p className="text-sm text-gray-600 whitespace-pre-line">{meeting.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col gap-2 sm:w-[140px] shrink-0">
                    {meeting.meetingLink && !meeting.isPast && (
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm
                          ${meeting.status === 'completed' || meeting.isPast
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        onClick={(e) => {
                          if (meeting.status === 'completed' || meeting.isPast) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Video size={16} className="flex-shrink-0" />
                        <span>Join</span>
                      </a>
                    )}

                    <button
                      onClick={() => toggleInterview(dateIndex, meeting.id)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50"
                    >
                      {meeting.expanded ? (
                        <>
                          <span>Hide</span>
                          <SortDesc size={16} className="flex-shrink-0" />
                        </>
                      ) : (
                        <>
                          <span>Details</span>
                          <Plus size={16} className="flex-shrink-0" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-50">
      <NavSeeker />
      
      {/* Main Container */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Desktop Layout */}
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Interviews</h1>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              Manage and track your upcoming and past interviews
            </p>
          </div>

          {/* Desktop Two-Column Layout */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Left Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-8">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${activeTab === 'upcoming'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <span className="truncate">Upcoming Interviews</span>
                    {interviews?.upcoming?.length > 0 && (
                      <span className="ml-auto bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                        {interviews.upcoming.reduce((acc, group) => acc + group.meetings.length, 0)}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('past')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${activeTab === 'past'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <span className="truncate">Past Interviews</span>
                    {interviews?.past?.length > 0 && (
                      <span className="ml-auto bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                        {interviews.past.reduce((acc, group) => acc + group.meetings.length, 0)}
                      </span>
                    )}
                  </button>
                </nav>

                {/* Quick Stats */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Total Interviews</p>
                      <p className="text-lg font-medium text-gray-900">
                        {Object.values(interviews).reduce((acc, tab) => 
                          acc + tab.reduce((sum, group) => sum + group.meetings.length, 0), 0
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Upcoming</p>
                      <p className="text-lg font-medium text-gray-900">
                        {interviews?.upcoming?.reduce((acc, group) => acc + group.meetings.length, 0) || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <main className="lg:col-span-9">
              {/* Mobile Tabs - Only show on mobile */}
              <div className="mb-6 border-b lg:hidden">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`pb-4 relative ${
                      activeTab === 'upcoming'
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Upcoming
                    {activeTab === 'upcoming' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`pb-4 relative ${
                      activeTab === 'past'
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Past
                    {activeTab === 'past' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600">Loading interviews...</p>
                </div>
              ) : interviews[activeTab]?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">No Interviews Found</h3>
                  <p className="mt-2 text-gray-600 max-w-sm mx-auto">
                    {activeTab === 'upcoming' 
                      ? "You don't have any upcoming interviews scheduled."
                      : "You don't have any past interviews."}
                  </p>
                </div>
              ) : (
                <InterviewList interviews={interviews} activeTab={activeTab} />
              )}
            </main>
          </div>
        </div>
      </div>

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
  );
};

export default JobSeekerInterviews; 