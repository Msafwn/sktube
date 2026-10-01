import api from './api';

const subscriptionService = {
  // Toggle subscription (subscribe/unsubscribe)
  toggleSubscription: async (channelId) => {
    const response = await api.post(`/subscriptions/c/${channelId}`);
    return response.data;
  },

  // Get channel subscribers
  getUserChannelSubscribers: async (channelId) => {
    const response = await api.get(`/subscriptions/c/${channelId}`);
    return response.data;
  },

  // Get subscribed channels
  getSubscribedChannels: async (subscriberId) => {
    const response = await api.get(`/subscriptions/u/${subscriberId}`);
    return response.data;
  },
};

export default subscriptionService;
