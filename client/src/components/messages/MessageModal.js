import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MessageModal = ({ isOpen, onClose, jobseekerId, employerId, jobTitle, companyName }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      console.log('Attempting to send message:', {
        jobseekerId,
        employerId,
        message,
        jobTitle,
        companyName
      });

      if (!jobseekerId && !employerId) {
        throw new Error('Recipient ID is missing');
      }

      const response = await axios.post('/api/messages/send', {
        receiverId: jobseekerId || employerId,
        message: message
      }, {
        baseURL: process.env.REACT_APP_API_URL,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setMessage('');
        onClose();
        navigate(`/messages?userId=${jobseekerId || employerId}`);
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleViewConversation = () => {
    onClose();
    navigate('/messages', { 
      state: { 
        selectedUserId: jobseekerId || employerId,
        companyName: companyName,
        jobTitle: jobTitle
      } 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">
          Message {jobseekerId ? 'Candidate' : 'Recruiter'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Regarding: {jobTitle} {companyName ? `at ${companyName}` : ''}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type your message here..."
            required
          />
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleViewConversation}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              View Conversation
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal; 