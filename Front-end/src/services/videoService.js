import api from './api';

export const videoService = {
  // Get all published videos (with optional pagination & search query)
  async getAllVideos(params = {}) {
    const response = await api.get('/videos', { params });
    return response.data;
  },

  // Get single video by ID
  async getVideoById(videoId) {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  },

  // Upload video with Cloudinary/Multer FormData (videoFile & thumbnail)
  async publishVideo(formData, onUploadProgress) {
    const response = await api.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  // Update video details (Title, Description, and new Thumbnail)
  async updateVideo(videoId, data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.patch(`/videos/${videoId}`, data, config);
    return response.data;
  },

  // Delete video
  async deleteVideo(videoId) {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
  },

  // Toggle publish status
  async togglePublishStatus(videoId) {
    const response = await api.patch(`/videos/toggle/publish/${videoId}`);
    return response.data;
  },
};

export default videoService;
