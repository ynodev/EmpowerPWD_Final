import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Bell, Menu, X } from 'lucide-react';
import axios from 'axios';
import logo from "../../assets/img/logo.svg";
import LoadingOverlay from './loadingOverlay';

const NavSeeker = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('isVerified');
      localStorage.removeItem('userRole');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No userId found in localStorage');
        return;
      }

      console.log('Fetching notifications with userId:', userId);

      const response = await axios.get(`/api/notifications?userId=${userId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Notifications response:', response.data);

      if (response.data.success) {
        setNotifications(response.data.data);
        // Update unread count using isRead instead of read
        const unreadCount = response.data.data.filter(notif => !notif.isRead).length;
        setUnreadCount(unreadCount);
      } else {
        console.warn('Failed to fetch notifications:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No userId found in localStorage');
        return;
      }

      const response = await axios.patch(
        `/api/notifications/${notification._id}/read?userId=${userId}`,
        {},
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        setActiveDropdown(null); // Close notifications panel

        // Navigate based on notification type
        if (notification.type === 'application' || notification.type === 'interview') {
          navigate('/my-application');
        }
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      handleLogout();
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }, 1000);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await axios.get('/api/messages/unread-count', {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setUnreadMessages(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      setUnreadMessages(0);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No userId found in localStorage');
        return;
      }

      await axios.put(`/api/notifications/mark-all-read?userId=${userId}`, {}, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Function to handle dropdown toggles
  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownName);
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
  };

  // Add useEffect for fetching notifications
  useEffect(() => {
    fetchNotifications(); // Initial fetch
    const notificationInterval = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds
    
    return () => clearInterval(notificationInterval);
  }, []); // Empty dependency array means this runs once on mount

  // Add useEffect for fetching unread messages count
  useEffect(() => {
    fetchUnreadMessagesCount(); // Initial fetch
    const messageInterval = setInterval(fetchUnreadMessagesCount, 30000); // Fetch every 30 seconds
    
    return () => clearInterval(messageInterval);
  }, []); // Empty dependency array means this runs once on mount

  // Add this useEffect to handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="flex items-center justify-between p-4 bg-white shadow-md z-50 sticky top-0 font-poppins">
        {/* Logo and Navigation Section */}
        <div className="flex items-center space-x-4 pl-4">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="Company logo" 
              className="w-12 h-12 mr-4" 
              style={{ borderRadius: '2px' }}
            />
            <Link to="#" className="font-bold text-lg">EmpowerPWD</Link>
          </div>

          {/* Desktop Navigation - Now inline with logo */}
          <div className="hidden md:flex items-center">
            <div className="border-l-2 border-black h-6 mx-4"></div>
            <div className="flex space-x-6">
              <Link 
                to="/job-list" 
                className="text-gray-500 hover:text-gray-700 whitespace-nowrap"
              >
                Find Jobs
              </Link>
              <Link 
                to="/explore-companies" 
                className="text-gray-500 hover:text-gray-700 whitespace-nowrap"
              >
                Companies
              </Link>
              <Link 
                to="/blogs" 
                className="text-gray-500 hover:text-gray-700 whitespace-nowrap"
              >
                Blog
              </Link>
            </div>
          </div>
        </div>

        {/* Right Section - Icons and Profile */}
        <div className="flex items-center">
          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4 pr-4">
            {/* Messages Icon */}
            <Link 
              to="/messages"
              className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
            >
              <MessageCircle className="h-6 w-6" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </Link>

            {/* Notifications Icon */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('notifications')}
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {activeDropdown === 'notifications' && (
                <div className="dropdown-container absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Notifications ({notifications.length})
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications && notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`block px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white
                                ${notification.type === 'application' ? 'bg-green-500' : 
                                  notification.type === 'interview' ? 'bg-blue-500' : 
                                  notification.type === 'message' ? 'bg-purple-500' : 'bg-gray-500'}`}>
                                {notification.type.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-3 flex-grow">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No notifications yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => toggleDropdown('profile')}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">JS</span>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {activeDropdown === 'profile' && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                  <Link 
                    to="/seeker/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Your Profile
                  </Link>
                  <Link 
                    to="/my-application" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Applications
                  </Link>
                  <Link 
                    to="/jobseeker/interviews" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Interviews
                  </Link>
                  <button 
                    onClick={handleLogoutClick} 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] bg-white z-40">
          <div className="max-w-lg mx-auto">
            <div className="flex flex-col p-4">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 px-4">MENU</h3>
                <Link 
                  to="/job-list" 
                  className="flex items-center text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg" 
                  onClick={closeAllDropdowns}
                >
                  Find Jobs
                </Link>
                <Link 
                  to="/explore-companies" 
                  className="flex items-center text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg" 
                  onClick={closeAllDropdowns}
                >
                  Companies
                </Link>
              </div>

              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 px-4">FEATURES</h3>
                <Link 
                  to="/messages"
                  className="flex items-center justify-between w-full text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg"
                  onClick={closeAllDropdowns}
                >
                  <span>Messages</span>
                  {unreadMessages > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadMessages}
                    </span>
                  )}
                </Link>

                <button 
                  onClick={() => {
                    setIsMenuOpen(false); // Close the menu
                    setActiveDropdown('notifications'); // Open notifications
                  }}
                  className="flex items-center justify-between w-full text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg"
                >
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 px-4">PROFILE</h3>
                <Link 
                  to="/seeker/profile" 
                  className="flex items-center text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg" 
                  onClick={closeAllDropdowns}
                >
                  Your Profile
                </Link>
                <Link 
                  to="/my-application" 
                  className="flex items-center text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg" 
                  onClick={closeAllDropdowns}
                >
                  Applications
                </Link>
                <Link 
                  to="/jobseeker/interviews" 
                  className="flex items-center text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg" 
                  onClick={closeAllDropdowns}
                >
                  Interviews
                </Link>
                <button 
                  onClick={handleLogoutClick}
                  className="flex items-center w-full text-left text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Notifications Panel */}
      {activeDropdown === 'notifications' && (
        <div className="dropdown-container md:hidden fixed inset-0 top-[73px] bg-white z-50 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <button 
                onClick={() => setActiveDropdown(null)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 mb-4"
              >
                Mark all as read
              </button>
            )}

            <div className="space-y-2">
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-lg cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white
                          ${notification.type === 'application' ? 'bg-green-500' : 
                            notification.type === 'interview' ? 'bg-blue-500' : 
                            notification.type === 'message' ? 'bg-purple-500' : 'bg-gray-500'}`}>
                          {notification.type.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-3 flex-grow">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No notifications yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-11/12 max-w-md mx-auto">
            <p className="mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-4">
              <button onClick={cancelLogout} className="bg-white px-4 py-2 rounded-full border border-black hover:bg-black hover:text-white">Cancel</button>
              <button onClick={confirmLogout} className="bg-black rounded-full text-white px-4 py-2 hover:bg-red-600">
                {isLoggingOut ? 'Logging out...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Loading Overlay */}
      {isLoggingOut && <LoadingOverlay />}
    </>
  );
};

export default NavSeeker;