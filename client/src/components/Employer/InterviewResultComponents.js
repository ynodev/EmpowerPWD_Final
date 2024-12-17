import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true
});

export const InterviewResultModal = ({ interview, onClose, onUpdate }) => {
  const [result, setResult] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      if (!result) {
        setError('Please select a result (Accept or Reject)');
        return;
      }

      setLoading(true);
      setError('');

      console.log('Submitting interview result:', {
        id: interview.id,
        result,
        feedback,
        jobId: interview.jobId,
        jobseekerId: interview.jobseekerId,
        applicationId: interview.applicationId
      });

      const response = await api.put(`/api/interviews/${interview.id}/complete`, {
        result,
        feedback,
        jobId: interview.jobId,
        jobseekerId: interview.jobseekerId,
        applicationId: interview.applicationId
      });

      if (response.data.success) {
        alert(
          `Candidate has been ${result === 'accepted' ? 'accepted' : 'rejected'}. ${
            result === 'accepted' 
              ? 'They will be notified of their acceptance.' 
              : 'They will be notified of the decision.'
          }`
        );
        onUpdate(); // Refresh the interview list
        onClose(); // Close the modal
      } else {
        throw new Error(response.data.message || 'Failed to update interview result');
      }
    } catch (error) {
      console.error('Error updating interview result:', error);
      setError(error.response?.data?.message || 'Failed to update interview result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg max-w-md w-full shadow-xl">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">Interview Result</h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setResult('accepted')}
                  disabled={loading}
                  className={`p-4 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                    result === 'accepted' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-green-200 hover:bg-green-50/50'
                  }`}
                >
                  <CheckCircle size={20} />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => setResult('rejected')}
                  disabled={loading}
                  className={`p-4 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                    result === 'rejected' 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-gray-200 hover:border-red-200 hover:bg-red-50/50'
                  }`}
                >
                  <XCircle size={20} />
                  <span>Reject</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback for Candidate (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={loading}
                className="w-full border rounded-lg p-3 h-32 resize-none disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter feedback for the candidate..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!result || loading}
              className={`w-full py-3 rounded-lg text-white font-medium transition-colors ${
                !result || loading 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Result'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InterviewResultContent = ({ interview }) => {
  const getResultColor = (result) => {
    switch (result) {
      case 'accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className={`inline-block px-3 py-1 rounded-full text-sm border ${getResultColor(interview.result)}`}>
        {interview.result === 'accepted' ? 'Accepted' : 'Rejected'}
      </div>
      {interview.feedback && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback</h4>
          <p className="text-sm text-gray-600">{interview.feedback}</p>
        </div>
      )} 
    </div>
  );
};