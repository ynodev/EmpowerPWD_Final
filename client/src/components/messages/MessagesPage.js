import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import NavSeeker from '../ui/navSeeker';
import NavEmployer from '../ui/navEmployer';
import { Search, MessageCircle, Briefcase, AlertCircle, MoreVertical, Pencil, Trash2, Check, X, ArrowLeft, Send } from 'lucide-react';
import { debounce } from 'lodash';

const POLLING_INTERVAL = 2000; // 2 seconds for more real-time feel
const BACKGROUND_POLLING_INTERVAL = 5000; // 5 seconds for background updates
const MESSAGE_LIMIT = 50; // Limit number of messages loaded

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const navigate = useNavigate();

  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole')?.toLowerCase());

  // Add new state for tracking updates
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isPolling, setIsPolling] = useState(false);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [showMessageActions, setShowMessageActions] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    console.log('Current user role:', role);
    setUserRole(role?.toLowerCase());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/api/users/current');
        if (response.data.success) {
          setCurrentUser(response.data.user);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        navigate('/login');
      }
    };
    fetchCurrentUser();
  }, [navigate]);

  // Debounced version of fetchMessages
  const debouncedFetchMessages = useRef(
    debounce(async (partnerId) => {
      if (!partnerId || !currentUser) return;
      
      try {
        const response = await axios.get(`/api/messages/messages/${partnerId}`, {
          params: {
            after: lastUpdate,
            limit: MESSAGE_LIMIT
          }
        });
        
        if (response.data.success) {
          // Only update if there are new messages
          if (response.data.data.length > 0) {
            setMessages(prev => [...prev, ...response.data.data]);
            setLastUpdate(Date.now());
            setTimeout(scrollToBottom, 100);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }, 500)
  ).current;

  // Optimized conversation fetching
  const fetchConversations = async (force = false) => {
    if (!currentUser || (isPolling && !force)) return;

    try {
      setIsPolling(true);
      const response = await axios.get('/api/messages/conversations', {
        params: { after: lastUpdate }
      });
      
      if (response.data.success) {
        // Only update if there are changes
        if (response.data.data.length > 0) {
          setConversations(prev => {
            const newConvs = [...prev];
            response.data.data.forEach(newConv => {
              const index = newConvs.findIndex(c => c.partner._id === newConv.partner._id);
              if (index >= 0) {
                // Update existing conversation
                newConvs[index] = {
                  ...newConvs[index],
                  lastMessage: newConv.lastMessage,
                  unreadCount: newConv.unreadCount
                };
              } else {
                // Add new conversation
                newConvs.push(newConv);
              }
            });
            return newConvs;
          });
          setLastUpdate(Date.now());
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsPolling(false);
      setLoading(false);
    }
  };

  // Update polling logic
  useEffect(() => {
    let pollInterval;

    if (currentUser) {
      // Initial fetch
      fetchConversations(true);
      
      // Set up polling
      pollInterval = setInterval(() => {
        fetchConversations();
      }, POLLING_INTERVAL);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [currentUser]);

  // Add fetchMessages function definition
  const fetchMessages = async (partnerId) => {
    if (!partnerId || !currentUser) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/messages/messages/${partnerId}`);
      
      if (response.data.success) {
        setMessages(response.data.data);
        setError(null);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Update the polling intervals
  const POLLING_INTERVAL = 2000; // 2 seconds for more real-time feel
  const BACKGROUND_POLLING_INTERVAL = 5000; // 5 seconds for background updates

  // Update the message polling effect
  useEffect(() => {
    let messagesPollInterval;
    let conversationsPollInterval;

    const pollMessages = async () => {
      if (selectedConversation?.partner?._id) {
        try {
          const response = await axios.get(`/api/messages/messages/${selectedConversation.partner._id}`, {
            params: { after: lastUpdate }
          });
          
          if (response.data.success && response.data.data.length > 0) {
            setMessages(prev => {
              // Filter out duplicates
              const newMessages = response.data.data.filter(
                newMsg => !prev.some(existingMsg => existingMsg._id === newMsg._id)
              );
              return [...prev, ...newMessages];
            });
            setLastUpdate(Date.now());
            setTimeout(scrollToBottom, 100);
          }
        } catch (error) {
          console.error('Error polling messages:', error);
        }
      }
    };

    const pollConversations = async () => {
      if (currentUser) {
        await fetchConversations(false);
      }
    };

    if (selectedConversation?.partner?._id) {
      // Initial fetch
      fetchMessages(selectedConversation.partner._id);
      
      // Set up frequent polling for active conversation
      messagesPollInterval = setInterval(pollMessages, POLLING_INTERVAL);
      
      // Set up background polling for conversations
      conversationsPollInterval = setInterval(pollConversations, BACKGROUND_POLLING_INTERVAL);
    }

    return () => {
      if (messagesPollInterval) clearInterval(messagesPollInterval);
      if (conversationsPollInterval) clearInterval(conversationsPollInterval);
    };
  }, [selectedConversation?.partner?._id, currentUser]);

  // Update handleSend for instant feedback
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation?.partner?._id) return;

    const messageText = newMessage.trim();
    const tempId = Date.now().toString(); // Temporary ID for optimistic update
    
    // Clear input immediately
    setNewMessage('');

    // Add message optimistically
    const optimisticMessage = {
      _id: tempId,
      senderId: { _id: currentUser._id },
      receiverId: { _id: selectedConversation.partner._id },
      message: messageText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setTimeout(scrollToBottom, 100);

    try {
      const response = await axios.post('/api/messages/send', {
        receiverId: selectedConversation.partner._id,
        message: messageText
      });
      
      if (response.data.success) {
        // Replace optimistic message with real one
        setMessages(prev => prev.map(msg => 
          msg._id === tempId ? response.data.data : msg
        ));
        setLastUpdate(Date.now());
        
        // Update conversations in background
        fetchConversations(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setError('Failed to send message. Please try again.');
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => 
    conv.partner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug logging
  useEffect(() => {
    console.log('Current messages:', messages);
  }, [messages]);

  // Add this effect to handle initial conversation selection
  useEffect(() => {
    const initializeConversation = async () => {
      if (location.state?.selectedUserId && conversations.length > 0) {
        const conversation = conversations.find(
          conv => conv.partner._id === location.state.selectedUserId
        );
        
        if (conversation) {
          setSelectedConversation(conversation);
        } else {
          // If conversation doesn't exist yet, create a temporary one
          const response = await axios.get(`/api/users/${location.state.selectedUserId}`);
          if (response.data.success) {
            setSelectedConversation({
              partner: response.data.user,
              lastMessage: null,
              unreadCount: 0
            });
          }
        }
      }
    };

    initializeConversation();
  }, [location.state, conversations]);

  // Add this function to your component
  const markMessagesAsRead = async (partnerId) => {
    try {
      await axios.put(`/api/messages/read/${partnerId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Update handleConversationSelect
  const handleConversationSelect = (conv) => {
    if (!conv?.partner?._id) return;
    
    setSelectedConversation(conv);
    setError(null);
    fetchMessages(conv.partner._id);
    markMessagesAsRead(conv.partner._id);
  };

  const handleEditMessage = async (messageId, newText) => {
    try {
      const response = await axios.put(`/api/messages/${messageId}`, {
        message: newText
      });

      if (response.data.success) {
        setMessages(messages.map(msg => 
          msg._id === messageId ? { ...msg, message: newText } : msg
        ));
        setEditingMessageId(null);
        setEditedMessage('');
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await axios.delete(`/api/messages/${messageId}`);
      if (response.data.success) {
        setMessages(messages.filter(msg => msg._id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditional Navigation */}
      {userRole === 'employer' ? <NavEmployer /> : <NavSeeker />}
      
      {/* Update the container classes to work with both nav styles */}
      <div className={`transition-all duration-300 ${userRole === 'employer' ? 'md:ml-64' : ''}`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
          <div className="bg-white rounded-xl shadow">
            <div className="h-[calc(100vh-120px)]">
              {/* Main Layout */}
              <div className="h-full flex">
                {/* Conversations List - Hidden on mobile when conversation is selected */}
                <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col
                  ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                  {/* Search Bar */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Conversations List */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                      {conversations.map((conversation) => (
                        <button
                          key={conversation._id}
                          onClick={() => handleConversationSelect(conversation)}
                          className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors
                            ${selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''}`}
                        >
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-medium text-gray-600">
                            {conversation.partner?.email?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <h3 className="font-medium text-gray-900 truncate">
                              {conversation.partner?.email || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage?.message || 'No messages yet'}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Messages Area - Full width on mobile when conversation is selected */}
                <div className={`flex-1 flex flex-col
                  ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
                  {selectedConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-3 sm:p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {/* Back button - Only visible on mobile */}
                          <button 
                            onClick={() => setSelectedConversation(null)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-medium text-gray-600">
                            {selectedConversation.partner?.email?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="font-medium text-gray-900 truncate">
                              {selectedConversation.partner?.email || 'Unknown User'}
                            </h2>
                            {selectedConversation.partner?.role && (
                              <p className="text-sm text-gray-500 capitalize truncate">
                                {selectedConversation.partner.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                        {error ? (
                          <div className="flex flex-col items-center justify-center h-full text-red-500">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p>{error}</p>
                            <button 
                              onClick={() => fetchMessages(selectedConversation.partner._id)}
                              className="mt-2 text-blue-500 hover:text-blue-600"
                            >
                              Try again
                            </button>
                          </div>
                        ) : loading ? (
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-4 text-gray-500">Loading messages...</p>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((message, index) => {
                              if (index > 0 && messages[index - 1]._id === message._id) return null;
                              const isOwnMessage = message.senderId._id === currentUser?._id;

                              return (
                                <div
                                  key={message._id}
                                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group relative`}
                                >
                                  {isOwnMessage && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center mr-2">
                                      <div className="relative">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMessageActions(showMessageActions === message._id ? null : message._id);
                                          }}
                                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                          <MoreVertical className="w-4 h-4 text-gray-500" />
                                        </button>

                                        {showMessageActions === message._id && (
                                          <>
                                            <div 
                                              className="fixed inset-0 z-[49]" 
                                              onClick={() => setShowMessageActions(null)}
                                            />
                                            
                                            <div className="absolute left-0 mt-1 w-32 bg-white rounded-xl shadow-lg border py-1 z-50">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setEditingMessageId(message._id);
                                                  setEditedMessage(message.message);
                                                  setShowMessageActions(null);
                                                }}
                                                className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                              >
                                                <Pencil className="w-4 h-4" />
                                                Edit
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteMessage(message._id);
                                                  setShowMessageActions(null);
                                                }}
                                                className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                      isOwnMessage
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100'
                                    }`}
                                  >
                                    {editingMessageId === message._id ? (
                                      <div className="flex flex-col gap-2">
                                        <input
                                          type="text"
                                          value={editedMessage}
                                          onChange={(e) => setEditedMessage(e.target.value)}
                                          className={`w-full px-2 py-1 rounded ${
                                            isOwnMessage 
                                              ? 'bg-white/10 text-white border-white/20' 
                                              : 'bg-white border-gray-200'
                                          } border focus:outline-none`}
                                          autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                          <button
                                            onClick={() => {
                                              setEditingMessageId(null);
                                              setEditedMessage('');
                                            }}
                                            className="p-1 hover:bg-white/10 rounded-full"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleEditMessage(message._id, editedMessage)}
                                            className="p-1 hover:bg-white/10 rounded-full"
                                          >
                                            <Check className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <p className="whitespace-pre-wrap break-words">
                                          {message.message}
                                          {message.edited && (
                                            <span className="text-xs ml-2 opacity-70">(edited)</span>
                                          )}
                                        </p>
                                        <span className={`text-xs ${
                                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                        } mt-1 block`}>
                                          {formatTime(message.createdAt)}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="p-3 sm:p-4 border-t border-gray-100">
                        <form onSubmit={handleSend} className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2 sm:py-3 border border-gray-200 rounded-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                          <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 
                              disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                          >
                            <span className="hidden sm:inline">Send</span>
                            <Send className="w-5 h-5 sm:hidden" />
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center p-4">
                        <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">Select a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 