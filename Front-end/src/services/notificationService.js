import api from './api';

const notificationService = {
  // Fetch paginated user notifications with optional filter
  getUserNotifications: async (type = 'all', page = 1, limit = 30) => {
    const params = { page, limit };
    if (type && type !== 'all') {
      params.type = type;
    }
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // Delete a specific notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  }
};

export default notificationService;
