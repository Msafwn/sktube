import api from './api';

const dashboardService = {
  // Get creator channel statistics (totalViews, totalSubscribers, totalVideos, totalLikes)
  getChannelStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get all videos uploaded by current logged in user/channel
  getChannelVideos: async () => {
    const response = await api.get('/dashboard/videos');
    return response.data;
  }
};

export default dashboardService;
