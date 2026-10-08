import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Central Axios instance configured for Express backend with httpOnly cookies
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30-second default timeout to prevent indefinite hangs
  withCredentials: true, // Automatically pass secure httpOnly cookies (JWT access token & refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// =========================================================================
// REQUEST INTERCEPTOR: Security Headers, FormData Handling & Dev Tracing
// =========================================================================
api.interceptors.request.use(
  (config) => {
    // 1. Attach standard CSRF defense-in-depth header (unforgeable by cross-site HTML forms)
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    // 2. Dynamic FormData handling: remove hardcoded application/json so browser sets multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // 3. Attach start timestamp in development mode for latency monitoring
    if (import.meta.env.DEV) {
      config.metadata = { startTime: performance.now() };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================================
// RESPONSE INTERCEPTOR: Token Refresh on 401, Session Expiry & Error Format
// =========================================================================
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
  (response) => {
    // In development mode, warn on unusually slow responses (> 3 seconds)
    if (import.meta.env.DEV && response.config?.metadata?.startTime) {
      const duration = (performance.now() - response.config.metadata.startTime).toFixed(0);
      if (duration > 3000) {
        console.warn(`⚠️ [SLOW API] ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized / Token Expired
    if (error.response?.status === 401 && !originalRequest?._retry) {
      // Don't retry for login, register or refresh-token endpoints to prevent infinite loops
      if (
        originalRequest?.url?.includes('/users/login') ||
        originalRequest?.url?.includes('/users/refresh-token') ||
        originalRequest?.url?.includes('/users/register')
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
        // Dispatch session expired event so AuthContext resets user state cleanly
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:session-expired', {
            detail: { message: 'Your session has expired. Please log in again.' }
          }));
        }
      } finally {
        isRefreshing = false;
      }
    }

    // If request was canceled/aborted by AbortController, reject directly without converting to custom 500 error
    if (axios.isCancel(error) || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    // Friendly message for timeouts
    let message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = 'Request timed out. Please check your internet connection and try again.';
    }

    const customError = {
      status: error.response?.status || 500,
      message,
      errors: error.response?.data?.errors || [],
      raw: error,
    };
    return Promise.reject(customError);
  }
);

// =========================================================================
// IN-FLIGHT REQUEST DEDUPLICATION (For GET Requests)
// Reuses identical pending in-flight promises across simultaneous callers
// =========================================================================
const inFlightRequests = new Map();
const originalGet = api.get.bind(api);

api.get = (url, config = {}) => {
  // If explicitly bypassed or signal is already aborted, skip deduplication
  if (config.skipDedupe || config.signal?.aborted) {
    return originalGet(url, config);
  }

  // Create unique signature based on URL and query params
  const paramKey = config.params ? JSON.stringify(config.params) : '';
  const dedupeKey = `GET:${url}:${paramKey}`;

  // If identical request is currently in-flight, return the shared pending promise
  if (inFlightRequests.has(dedupeKey)) {
    const sharedPromise = inFlightRequests.get(dedupeKey);

    // If caller provided an AbortSignal, link it to this caller's promise
    if (config.signal) {
      return new Promise((resolve, reject) => {
        const onAbort = () => reject(new axios.CanceledError('canceled'));
        if (config.signal.aborted) return onAbort();

        config.signal.addEventListener('abort', onAbort);
        sharedPromise
          .then(resolve, reject)
          .finally(() => config.signal.removeEventListener('abort', onAbort));
      });
    }

    return sharedPromise;
  }

  // Start new network request and track it in inFlightRequests
  const promise = originalGet(url, config).finally(() => {
    inFlightRequests.delete(dedupeKey);
  });

  inFlightRequests.set(dedupeKey, promise);
  return promise;
};

export default api;

