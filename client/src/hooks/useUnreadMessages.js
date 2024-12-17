import { useState, useEffect } from 'react';
import axios from 'axios';

const POLLING_INTERVAL = 10000; // 10 seconds

export const useUnreadMessages = (userId) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/messages/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [userId]);

  return unreadCount;
}; 