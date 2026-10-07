import api from './api';

export const authService = {
  // Register new creator/user with multipart FormData (avatar & coverImage)
  async register(formData) {
    const response = await api.post('/users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Login user with username/email & password
  async login(credentials) {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  // Google OAuth Login
  async googleLogin(credential) {
    const response = await api.post('/users/google-login', { credential });
    return response.data;
  },

  // Logout current user (clears backend cookie)
  async logout() {
    const response = await api.post('/users/logout');
    return response.data;
  },

  // Get current authenticated user
  async getCurrentUser() {
    const response = await api.get('/users/current-user');
    return response.data;
  },

  // Refresh access token
  async refreshAccessToken() {
    const response = await api.post('/users/refresh-token');
    return response.data;
  },

  // Update account details (fullName, email)
  async updateAccountDetails(data) {
    const response = await api.patch('/users/update-account', data);
    return response.data;
  },

  // Update avatar image
  async updateAvatar(formData) {
    const response = await api.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update cover image
  async updateCoverImage(formData) {
    const response = await api.patch('/users/cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default authService;
