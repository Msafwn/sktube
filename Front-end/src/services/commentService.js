import api from './api';

const commentService = {
  // Get comments for a video (paginated, with optional AbortSignal)
  getVideoComments: async (videoId, page = 1, limit = 20, config = {}) => {
    const response = await api.get(`/comments/${videoId}`, {
      params: { page, limit },
      ...config
    });
    return response.data;
  },

  // Add a new comment or reply to a video
  addComment: async (videoId, content, parentComment = null) => {
    const payload = { content };
    if (parentComment) payload.parentComment = parentComment;
    const response = await api.post(`/comments/${videoId}`, payload);
    return response.data;
  },

  // Update a comment
  updateComment: async (commentId, content) => {
    const response = await api.patch(`/comments/c/${commentId}`, { content });
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/c/${commentId}`);
    return response.data;
  }
};

export default commentService;
