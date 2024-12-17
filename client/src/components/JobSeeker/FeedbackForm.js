import React, { useState } from 'react';
import axiosInstance from '../../utils/axios';
import { Star, X } from 'lucide-react';

const FeedbackForm = ({ open, handleClose, job, companyName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please provide a comment');
      return;
    }

    const employerId = job.employersId;
    const companyId = job.employer?.companyInfo?._id;

    if (!employerId || !companyId) {
      setError('Unable to submit feedback: Missing employer or company information');
      return;
    }

    try {
      const response = await axiosInstance.post('/api/feedback', {
        employer: employerId,
        company: companyId,
        rating,
        comment
      });

      console.log('Feedback response:', response.data);

      setSuccess('Feedback submitted successfully!');
      setTimeout(() => {
        handleClose();
        setRating(0);
        setComment('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.response?.data?.message || 'Error submitting feedback');
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-xl shadow-lg z-50">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Rate {companyName}</h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="p-1"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        value <= rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label 
                htmlFor="comment" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Comment
              </label>
              <textarea
                id="comment"
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FeedbackForm; 