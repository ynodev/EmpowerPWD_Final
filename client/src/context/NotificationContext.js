import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error('No userId found in localStorage');
                return;
            }

            console.log('Fetching notifications for userId:', userId);
            const response = await axiosInstance.get(`/api/notifications/employer/${userId}`);
            
            console.log('Notification response:', response.data);
            if (response.data.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.notifications.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await axiosInstance.put(`/api/notifications/${notificationId}/mark-read`);
            if (response.data.success) {
                setNotifications(prev => 
                    prev.map(notification => 
                        notification._id === notificationId 
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up polling every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <NotificationContext.Provider 
            value={{ 
                notifications, 
                unreadCount, 
                markAsRead, 
                loading,
                error 
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === null) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}; 