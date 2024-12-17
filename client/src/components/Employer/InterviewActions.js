import React, { useState } from 'react';
import { Calendar, X, AlertCircle, ChevronDown, ChevronUp, MoreHorizontal, Video, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import axios from 'axios';
import MessageModal from '../messages/MessageModal';
import RescheduleModal from './RescheduleModal';
import { InterviewResultModal } from './InterviewResultModal';

const CancellationReasons = [
  { value: 'schedule_conflict', label: 'Schedule Conflict' },
  { value: 'candidate_no_show', label: 'Candidate No Show' },
  { value: 'interviewer_unavailable', label: 'Interviewer Unavailable' },
  { value: 'technical_issues', label: 'Technical Issues' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'position_filled', label: 'Position Filled' },
  { value: 'candidate_withdrew', label: 'Candidate Withdrew' },
  { value: 'other', label: 'Other' }
];

// Add API configuration at the top
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true
});

export const InterviewActions = ({ interview, onUpdate, onToggleExpand, isExpanded, currentSchedule }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });

  // Add a function to check if actions should be disabled
  const isInterviewCompleted = interview.status === 'completed';
  const isInterviewCancelled = interview.status === 'cancelled';

  const handleCancel = async () => {
    try {
      console.log('Interview data:', interview);

      if (!interview.id) {
        throw new Error('Interview ID is missing');
      }

      const response = await api.post(`/api/interviews/${interview.id}/cancel`, {
        reason,
        additionalInfo
      });

      if (response.data.success) {
        setShowCancelModal(false);
        onUpdate();
        
        // Show cancellation success and prompt for rescheduling
        const shouldReschedule = window.confirm(
          'Interview cancelled successfully. Would you like to reschedule this interview now?'
        );
        
        if (shouldReschedule) {
          setShowRescheduleModal(true);
        } else {
          alert('Please remember to reschedule the interview later.');
        }
      } else {
        throw new Error(response.data.message || 'Failed to cancel interview');
      }
    } catch (error) {
      console.error('Error cancelling interview:', error);
      alert('Failed to cancel interview: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReschedule = async (newSchedule) => {
    try {
      console.log('Rescheduling interview:', {
        interviewId: interview.id,
        ...newSchedule
      });

      if (!interview.id) {
        throw new Error('Interview ID is missing');
      }

      const response = await api.post(`/api/interviews/${interview.id}/reschedule`, {
        dateTime: newSchedule.date,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime
      });

      if (response.data.success) {
        setShowRescheduleModal(false);
        onUpdate();
        alert('Interview rescheduled successfully');
      } else {
        throw new Error(response.data.message || 'Failed to reschedule interview');
      }
    } catch (error) {
      console.error('Error rescheduling interview:', error);
      alert('Failed to reschedule interview: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Show More Button */}
      

      {/* Actions Menu - Always show */}
      <div className="relative">
        <button
          onClick={() => setShowActionMenu(!showActionMenu)}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MoreHorizontal size={20} />
        </button>

        {showActionMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-10">
            {!isInterviewCompleted && !isInterviewCancelled && (
              <button
                onClick={() => {
                  setShowActionMenu(false);
                  setShowResultModal(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Mark as Done
              </button>
            )}
            <button
              onClick={() => {
                setShowActionMenu(false);
                setShowRescheduleModal(true);
              }}
              className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
            >
              Reschedule
            </button>
            {!isInterviewCancelled && (
              <button
                onClick={() => {
                  setShowActionMenu(false);
                  setShowCancelModal(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Cancel
              </button>
            )}
           
          
          </div>
        )}
      </div>

      {/* Chat and Join Buttons */}
      <div className="flex items-center gap-2">
        {/* Chat button - Always enabled */}
        <button
          onClick={() => setShowMessageModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
        >
          <MessageSquare size={16} />
          Chat
        </button>

        {/* Join button - Disabled if cancelled */}
        {!isInterviewCancelled ? (
          <a
            href={interview.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Video size={16} />
            Join
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-full cursor-not-allowed">
            <Video size={16} />
            Cancelled
          </span>
        )}
      </div>

      {/* Modals */}
      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        jobseekerId={interview.jobseekerId}
        jobTitle={interview.jobTitle}
        companyName={interview.job?.company}
      />

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Cancel Interview</h3>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mb-4 border rounded-lg p-2"
            >
              <option value="">Select Reason</option>
              {CancellationReasons.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Additional Information"
              className="w-full mb-4 border rounded-lg p-2"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-600"
              >
                Close
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        interview={interview}
        onReschedule={handleReschedule}
        currentSchedule={currentSchedule}
      />

      {/* Interview Result Modal */}
      {showResultModal && (
        <InterviewResultModal
          interview={interview}
          onClose={() => setShowResultModal(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

// Add a status badge component
const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Update the InterviewExpandedContent component
export const InterviewExpandedContent = ({ interview }) => {
  const isInterviewCancelled = interview.status === 'cancelled';

  return (
    <div className="mt-4 ml-[140px] space-y-4 pl-6 border-l-2 border-blue-100">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium text-gray-500">Status</h5>
        <StatusBadge status={interview.status} />
      </div>

      {/* Job Details */}
      <div className="bg-white rounded-lg border p-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">
          Job Details
        </h5>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Position:</span>
            <span className="text-sm text-gray-900">{interview.jobTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Company:</span>
            <span className="text-sm text-gray-900">{interview.job.company}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Location:</span>
            <span className="text-sm text-gray-900">{interview.job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Work Setup:</span>
            <span className="text-sm text-gray-900">{interview.job.workSetup}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Employment Type:</span>
            <span className="text-sm text-gray-900">{interview.job.employmentType}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-500">Industry:</span>
            <div className="flex flex-wrap gap-1">
              {interview.job.industry?.map((ind, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {ind}
                </span>
              ))}
            </div>
          </div>
          {interview.job.description && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-500">Description:</span>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {interview.job.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Warning - Show if cancelled */}
      {isInterviewCancelled && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <h6 className="font-medium text-red-700">Interview Cancelled</h6>
              <p className="text-sm text-red-600 mt-1">
                Cancelled on: {new Date(interview.cancellation?.cancelledAt).toLocaleDateString()} at{' '}
                {new Date(interview.cancellation?.cancelledAt).toLocaleTimeString()}
              </p>
              {interview.cancellation?.reason && (
                <p className="text-sm text-red-600 mt-1">
                  <span className="font-medium">Reason:</span>{' '}
                  {interview.cancellation.reason.replace(/_/g, ' ')}
                </p>
              )}
              {interview.cancellation?.additionalInfo && (
                <p className="text-sm text-red-600 mt-1">
                  <span className="font-medium">Additional Info:</span>{' '}
                  {interview.cancellation.additionalInfo}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rescheduling Info - Show if rescheduled */}
      {interview.status === 'rescheduled' && interview.rescheduledFrom && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <h6 className="font-medium text-yellow-700">Interview Rescheduled</h6>
              <p className="text-sm text-yellow-600 mt-1">
                Previously scheduled for:{' '}
                {new Date(interview.rescheduledFrom.date).toLocaleDateString()} at{' '}
                {interview.rescheduledFrom.startTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details */}
      <div className="bg-white rounded-lg border p-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">
          Candidate Details
        </h5>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Name:</span>
            <span className="text-sm text-gray-900">
              {interview.jobseeker?.name || 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <span className="text-sm text-gray-900">
              {interview.jobseeker?.email || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Meeting Details */}
      <div className="bg-white rounded-lg border p-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">
          Meeting Details
        </h5>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Time:</span>
            <span className="text-sm text-gray-900">
              {interview.startTime} - {interview.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Link:</span>
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 break-all"
            >
              {interview.meetingLink}
            </a>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {interview.notes && (
        <div className="bg-white rounded-lg border p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            Notes
          </h5>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{interview.notes}</p>
        </div>
      )}

      {/* Action Required - Show for cancelled interviews */}
      {interview.status === 'cancelled' && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <h6 className="font-medium text-blue-700">Action Required</h6>
              <p className="text-sm text-blue-600 mt-1">
                This interview needs to be rescheduled. Please set a new time slot for the candidate.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 