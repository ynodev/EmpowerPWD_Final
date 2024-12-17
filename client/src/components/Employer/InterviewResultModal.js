import React, { useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true
});

export const InterviewResultModal = ({ interview, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!result) {
        alert('Please select a result');
        return;
      }

      // Map the result to the correct enum value
      const resultMapping = {
        'accepted': 'hired',  // Change 'accepted' to 'hired' to match the enum
        'rejected': 'rejected'
      };

      // If accepting the applicant
      if (result === 'accepted') {
        const response = await api.post(`/api/interviews/${interview.id}/accept`, {
          feedback,
          result: resultMapping[result] // Send the mapped result
        });

        if (response.data.success) {
          console.log('Updated job data:', response.data.data.job);
          onUpdate();
          onClose();
          alert('Applicant successfully accepted!');
        }
      } else {
        // Handle rejection case
        const response = await api.patch(`/api/interviews/${interview.id}`, {
          status: 'completed',
          result: resultMapping[result], // Send the mapped result
          feedback
        });

        if (response.data.success) {
          onUpdate();
          onClose();
          alert('Application rejected');
        }
      }
    } catch (error) {
      console.error('Error updating interview result:', error);
      alert(error.response?.data?.message || 'Failed to update interview result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Update Interview Result</h3>
        
        {/* Result Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Result
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setResult('accepted')}
              className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                result === 'accepted'
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              Accept
            </button>
            <button
              onClick={() => setResult('rejected')}
              className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                result === 'rejected'
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              Reject
            </button>
          </div>
        </div>

        {/* Feedback Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border rounded-lg p-2 min-h-[100px]"
            placeholder="Enter feedback for the candidate..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !result}
            className={`px-4 py-2 rounded-lg text-white ${
              loading
                ? 'bg-blue-300'
                : result === 'accepted'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {loading ? 'Processing...' : 'Submit Result'}
          </button>
        </div>
      </div>
    </div>
  );
}; 