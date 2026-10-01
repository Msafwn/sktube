import api from './api';

const likeService = {
  // Toggle like on a video (like / unlike)
  toggleVideoLike: async (videoId) => {
    const response = await api.post(`/likes/toggle/v/${videoId}`);
    return response.data;
  },

  // Toggle like on a comment
  toggleCommentLike: async (commentId) => {
    const response = await api.post(`/likes/toggle/c/${commentId}`);
    return response.data;
  },

  // Toggle like on a tweet/community post
  toggleTweetLike: async (tweetId) => {
    const response = await api.post(`/likes/toggle/t/${tweetId}`);
    return response.data;
  },

  // Get all liked videos by current logged-in user
  getLikedVideos: async () => {
    const response = await api.get('/likes/videos');
    return response.data;
  }
};

export default likeService;
