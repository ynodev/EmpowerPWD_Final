import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavSeeker from '../ui/navSeeker';
import { Send, ArrowLeft } from 'lucide-react'; // Import icons

const Conversation = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/messages/conversation/${userId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setMessages(response.data.data);
      } else {
        setError('Failed to load messages');
      }
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load messages');
        console.error('Error fetching messages:', err);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post('http://localhost:5001/api/messages/send', {
        receiverId: userId,
        message: newMessage.trim()
      }, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setMessages(prev => [...prev, response.data.data]);
        setNewMessage('');
        fetchMessages();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        console.error('Error sending message:', err);
        setError('Failed to send message');
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading conversation...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavSeeker />
      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow h-[calc(100vh-80px)] flex flex-col">
          {/* Chat Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center gap-3">
            <button 
              onClick={() => navigate('/messages')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-semibold text-gray-800">Chat</h2>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : error ? 'Error' : 'Online'}
              </p>
            </div>
          </div>

          {/* Messages Container */}
          <div 
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.senderId === userId ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.senderId === userId
                      ? 'bg-gray-100 rounded-tl-none'
                      : 'bg-blue-500 text-white rounded-tr-none'
                  }`}
                >
                  <p className="break-words">{message.message}</p>
                  <span className={`text-xs mt-1 block ${
                    message.senderId === userId
                      ? 'text-gray-500'
                      : 'text-blue-100'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <div className="p-2 sm:p-4 border-t border-gray-200">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 sm:p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 sm:p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversation; 