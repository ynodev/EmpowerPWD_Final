import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { formatDistance } from 'date-fns';
import axiosInstance from '../../utils/axios';

const CompanyReviews = () => {
  const { employerId } = useParams();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedbackRes, companyRes] = await Promise.all([
          axiosInstance.get(`/api/feedback/employer/${employerId}`),
          axiosInstance.get(`/api/employers/${employerId}`)
        ]);

        setFeedbacks(feedbackRes.data.data);
        setCompanyInfo(companyRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employerId]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {companyInfo?.companyInfo?.companyName} Reviews
        </h1>
        <p className="text-gray-500">
          {feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Rating Summary */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {feedbacks.length > 0 
                ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
                : '0.0'
              }
            </div>
            <div className="flex items-center gap-1 justify-center mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`w-5 h-5 ${
                    star <= (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
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
                <div key={rating} className="flex items-center gap-2 text-sm mb-2">
                  <div className="w-12 text-gray-600">{rating} stars</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-gray-500">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {feedbacks.map((feedback, index) => (
          <div key={index} className="bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-medium text-blue-600">
                    {feedback.sender?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {feedback.sender?.firstName || 'Anonymous'} {feedback.sender?.lastName || 'User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistance(new Date(feedback.createdAt), new Date(), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(feedback.rating || 0)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-gray-700">{feedback.comment || 'No comment provided'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyReviews; 