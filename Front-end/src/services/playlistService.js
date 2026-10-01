import api from './api';

export const playlistService = {
  // Get all user playlists
  async getUserPlaylists(userId) {
    const response = await api.get(`/playlist/user/${userId}`);
    return response.data;
  },

  // Get single playlist by ID
  async getPlaylistById(playlistId) {
    const response = await api.get(`/playlist/${playlistId}`);
    return response.data;
  },

  // Create new playlist
  async createPlaylist(data) {
    const response = await api.post('/playlist', data);
    return response.data;
  },

  // Add video to playlist
  async addVideoToPlaylist(playlistId, videoId) {
    const response = await api.patch(`/playlist/add/${videoId}/${playlistId}`);
    return response.data;
  },

  // Remove video from playlist
  async removeVideoFromPlaylist(playlistId, videoId) {
    const response = await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
    return response.data;
  },

  // Delete playlist
  async deletePlaylist(playlistId) {
    const response = await api.delete(`/playlist/${playlistId}`);
    return response.data;
  },

  // Update playlist
  async updatePlaylist(playlistId, data) {
    const response = await api.patch(`/playlist/${playlistId}`, data);
    return response.data;
  },
};

export default playlistService;
