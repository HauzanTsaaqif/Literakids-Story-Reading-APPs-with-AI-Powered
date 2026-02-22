import axios from 'axios';
import { API_CONFIG } from '../config';
import { getBaseUrl } from './apiConfig';

// Create axios instance with dynamic base URL
const api = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize base URL from Firestore
let isBaseUrlInitialized = false;

/**
 * Initialize API base URL from Firestore
 * This will be called automatically on first API request
 */
const initializeBaseUrl = async () => {
  if (!isBaseUrlInitialized) {
    try {
      const baseUrl = await getBaseUrl();
      api.defaults.baseURL = baseUrl;
      isBaseUrlInitialized = true;
      console.log('🚀 API initialized with BASE_URL:', baseUrl);
    } catch (error) {
      console.error('❌ Failed to initialize BASE_URL:', error);
      // Fallback to default
      api.defaults.baseURL = API_CONFIG.DEFAULT_BASE_URL;
      console.log('🔄 Using default BASE_URL:', API_CONFIG.DEFAULT_BASE_URL);
    }
  }
};

// Request interceptor
api.interceptors.request.use(
  async config => {
    // Initialize base URL on first request
    await initializeBaseUrl();

    // Add auth token if available
    // const token = await getToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // No response received
      console.error('Network Error:', error.request);
    } else {
      // Request setup error
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  },
);

/**
 * Force refresh BASE_URL from Firestore
 * Useful when BASE_URL changes in Firestore
 */
export const refreshBaseUrl = async () => {
  try {
    isBaseUrlInitialized = false;
    const { clearBaseUrlCache } = await import('./apiConfig');
    clearBaseUrlCache();
    await initializeBaseUrl();
    console.log('✅ BASE_URL refreshed successfully');
    return api.defaults.baseURL;
  } catch (error) {
    console.error('❌ Failed to refresh BASE_URL:', error);
    throw error;
  }
};

/**
 * Get current BASE_URL being used by API
 * Ensures BASE_URL is initialized before returning
 */
export const getCurrentBaseUrl = async () => {
  // Ensure BASE_URL is initialized
  if (!isBaseUrlInitialized) {
    await initializeBaseUrl();
  }
  const currentUrl = api.defaults.baseURL || API_CONFIG.DEFAULT_BASE_URL;
  console.log('📍 Current BASE_URL:', currentUrl);
  return currentUrl;
};

/**
 * Manually set BASE_URL (for testing or override)
 */
export const setCustomBaseUrl = url => {
  if (url && typeof url === 'string') {
    api.defaults.baseURL = url.trim();
    isBaseUrlInitialized = true;
    console.log('✏️ BASE_URL manually set to:', url.trim());
  }
};

export default api;
