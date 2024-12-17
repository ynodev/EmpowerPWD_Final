import React, { useState, useEffect } from 'react';
import { Bell, Eye, Check, ArrowLeft, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavEmployer from '../ui/navEmployer';
import axios from 'axios';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error('No userId found in localStorage');
                return;
            }

            console.log('Fetching notifications for userId:', userId);
            const response = await axios.get(`/api/notifications?userId=${userId}`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                console.log('Fetched notifications:', response.data.data);
                setNotifications(response.data.data);
                // Update unread count
                const unreadCount = response.data.data.filter(notif => !notif.isRead).length;
                setUnreadCount(unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await axios.patch(
                `/api/notifications/${notificationId}/read?userId=${userId}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                // Update local state
                setNotifications(prevNotifications =>
                    prevNotifications.map(notif =>
                        notif._id === notificationId ? { ...notif, isRead: true } : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleViewDetails = async (notification) => {
        try {
            if (!notification.isRead) {
                await handleMarkAsRead(notification._id);
            }

            // Store the return path
            sessionStorage.setItem('returnToNotifications', 'true');

            // Navigate based on notification type and metadata
            if (notification.type === 'job_status') {
                const jobId = notification.metadata?.jobId;
                if (jobId) {
                    navigate(`/employer/jobs/${jobId}`);
                } else {
                    navigate('/job-dashboard');
                }
            } else {
                switch (notification.type) {
                    case 'application':
                        navigate(`/employer/applications/${notification.metadata?.applicationId || ''}`);
                        break;
                    case 'message':
                        navigate('/messages');
                        break;
                    case 'interview':
                        navigate('/employer/interviews');
                        break;
                    default:
                        navigate('/job-dashboard');
                }
            }
        } catch (error) {
            console.error('Error handling notification:', error);
        }
    };

    const handleBack = () => {
        navigate('/job-dashboard');
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <NavEmployer />
            <div className="ml-64 p-8 pt-24">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleBack}
                        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Dashboard
                    </button>

                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Bell className="h-6 w-6 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Notifications
                                    </h2>
                                </div>
                                {unreadCount > 0 && (
                                    <span className="text-sm text-gray-500">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-6 transition-colors ${
                                            !notification.isRead ? 'bg-blue-50' : 'bg-white'
                                        } hover:bg-gray-50`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-gray-900">
                                                        {notification.title}
                                                    </span>
                                                    {!notification.isRead && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {notification.message}
                                                </p>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    {formatDate(notification.createdAt)}
                                                </p>
                                            </div>
                                            <div className="ml-4 flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(notification)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                        title="Mark as Read"
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notification;
