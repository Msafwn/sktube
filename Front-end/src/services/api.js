import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Central Axios instance configured for Express backend with httpOnly cookies
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Automatically pass secure httpOnly cookies (JWT access token & refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor with Automatic Cookie-Based Token Refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized / Token Expired
    if (error.response?.status === 401 && !originalRequest?._retry) {
      // Don't retry for login, register or refresh-token endpoints to prevent infinite loops
      if (
        originalRequest.url?.includes('/users/login') ||
        originalRequest.url?.includes('/users/refresh-token') ||
        originalRequest.url?.includes('/users/register')
      ) {
        const customError = {
          status: 401,
          message: error.response?.data?.message || 'Invalid user credentials',
          errors: error.response?.data?.errors || [],
          raw: error
        };
        return Promise.reject(customError);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token via httpOnly cookie
        await axios.post(
          `${BASE_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // If request was canceled/aborted by AbortController, reject directly without converting to custom 500 error
    if (axios.isCancel(error) || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const customError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      errors: error.response?.data?.errors || [],
      raw: error,
    };
    return Promise.reject(customError);
  }
);

export default api;

