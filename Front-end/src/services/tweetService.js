import api from './api';

export const tweetService = {
  // Get all tweets / community posts
  async getAllTweets(params = {}) {
    const response = await api.get('/tweets', { params });
    return response.data;
  },

  // Get user tweets
  async getUserTweets(userId) {
    const response = await api.get(`/tweets/user/${userId}`);
    return response.data;
  },

  // Create tweet / post
  async createTweet(content) {
    const response = await api.post('/tweets', { content });
    return response.data;
  },

  // Update tweet
  async updateTweet(tweetId, content) {
    const response = await api.patch(`/tweets/${tweetId}`, { content });
    return response.data;
  },

  // Delete tweet
  async deleteTweet(tweetId) {
    const response = await api.delete(`/tweets/${tweetId}`);
    return response.data;
  },

  // Like / Unlike tweet
  async toggleTweetLike(tweetId) {
    const response = await api.post(`/likes/toggle/t/${tweetId}`);
    return response.data;
  },
};

export default tweetService;
