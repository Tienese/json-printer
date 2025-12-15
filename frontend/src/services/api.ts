import axios from 'axios';

/**
 * Base API client configuration.
 * In development, Vite proxy will forward requests to http://localhost:8080
 * In production, requests will go to the same host serving the React app
 */
export const apiClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add request interceptor for debugging (can be removed in production)
 */
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Add response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
