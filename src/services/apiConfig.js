import { firestore } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Default BASE_URL sebagai fallback
const DEFAULT_BASE_URL = 'https://uninfinite-shantae-vanadious.ngrok-free.dev';

// Cache untuk BASE_URL agar tidak perlu fetch setiap kali
let cachedBaseUrl = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

/**
 * Fetch BASE_URL dari Firestore collection "settings" document id "0"
 * Dengan caching untuk mengurangi pembacaan Firestore
 */
export const getBaseUrl = async () => {
  try {
    // Cek apakah cache masih valid
    const now = Date.now();
    if (
      cachedBaseUrl &&
      lastFetchTime &&
      now - lastFetchTime < CACHE_DURATION
    ) {
      return cachedBaseUrl;
    }

    // Fetch dari Firestore
    const settingsRef = doc(firestore, 'settings', '0');
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      const baseUrl = data.base_url;

      // Jika base_url ada dan valid, gunakan itu
      if (baseUrl && typeof baseUrl === 'string' && baseUrl.trim()) {
        cachedBaseUrl = baseUrl.trim();
        lastFetchTime = now;
        console.log('✅ BASE_URL loaded from Firestore:', cachedBaseUrl);
        return cachedBaseUrl;
      }
    }

    // Jika tidak ada atau kosong, gunakan default
    console.log(
      '⚠️ BASE_URL not found in Firestore, using default:',
      DEFAULT_BASE_URL,
    );
    cachedBaseUrl = DEFAULT_BASE_URL;
    lastFetchTime = now;
    return cachedBaseUrl;
  } catch (error) {
    console.error('❌ Error fetching BASE_URL from Firestore:', error.message);
    // Jika ada error, gunakan cache lama atau default
    if (cachedBaseUrl) {
      console.log('🔄 Using cached BASE_URL:', cachedBaseUrl);
      return cachedBaseUrl;
    }
    // Always fallback to DEFAULT_BASE_URL if everything fails
    console.log('🔄 Using default BASE_URL as fallback:', DEFAULT_BASE_URL);
    cachedBaseUrl = DEFAULT_BASE_URL; // Cache the default
    lastFetchTime = Date.now();
    return DEFAULT_BASE_URL;
  }
};

/**
 * Clear cache BASE_URL (gunakan jika ingin force refresh)
 */
export const clearBaseUrlCache = () => {
  cachedBaseUrl = null;
  lastFetchTime = null;
  console.log('🗑️ BASE_URL cache cleared');
};

/**
 * Get cached BASE_URL tanpa fetch (return null jika belum ada cache)
 */
export const getCachedBaseUrl = () => {
  return cachedBaseUrl;
};

/**
 * Set BASE_URL manually (untuk testing atau override)
 */
export const setBaseUrl = url => {
  if (url && typeof url === 'string') {
    cachedBaseUrl = url.trim();
    lastFetchTime = Date.now();
    console.log('✏️ BASE_URL manually set to:', cachedBaseUrl);
  }
};

export default {
  getBaseUrl,
  clearBaseUrlCache,
  getCachedBaseUrl,
  setBaseUrl,
  DEFAULT_BASE_URL,
};
