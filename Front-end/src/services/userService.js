import api from './api';

export const userService = {
  // Get watch history
  async getWatchHistory() {
    const response = await api.get('/users/history');
    return response.data;
  },

  // Clear watch history
  async clearWatchHistory() {
    const response = await api.delete('/users/history');
    return response.data;
  },

  // Remove single video from history
  async removeVideoFromHistory(videoId) {
    const response = await api.delete(`/users/history/${videoId}`);
    return response.data;
  },

  // Get liked videos
  async getLikedVideos() {
    const response = await api.get('/likes/videos');
    return response.data;
  },

  // Toggle like on video
  async toggleVideoLike(videoId) {
    const response = await api.post(`/likes/toggle/v/${videoId}`);
    return response.data;
  },

  // Get user subscriptions
  async getSubscribedChannels(subscriberId) {
    const response = await api.get(`/subscriptions/u/${subscriberId}`);
    return response.data;
  },

  // Toggle channel subscription
  async toggleSubscription(channelId) {
    const response = await api.post(`/subscriptions/c/${channelId}`);
    return response.data;
  },

  // Get user channel profile
  async getUserChannelProfile(username) {
    const response = await api.get(`/users/c/${username}`);
    return response.data;
  },

  // Update Account Details (Full Name, Email)
  async updateAccountDetails(data) {
    const response = await api.patch('/users/update-account', data);
    return response.data;
  },

  // Update Avatar Profile Picture
  async updateAvatar(formData) {
    const response = await api.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update Channel Cover Banner
  async updateCoverImage(formData) {
    const response = await api.patch('/users/cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Change Password
  async changePassword(data) {
    const response = await api.post('/users/change-password', data);
    return response.data;
  }
};

export default userService;

