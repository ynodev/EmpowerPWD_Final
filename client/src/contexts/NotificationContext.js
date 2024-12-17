const fetchNotifications = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.log('No user ID found');
      return;
    }

    const response = await axios.get(`/api/notifications/${userId}`);
    if (response.data && Array.isArray(response.data.notifications)) {
      const sortedNotifications = response.data.notifications
        .filter(notification => notification) // Filter out null/undefined
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sortedNotifications);
    } else {
      setNotifications([]);
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    setNotifications([]);
  }
}; 