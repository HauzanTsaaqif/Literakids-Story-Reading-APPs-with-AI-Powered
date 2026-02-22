// Setup Script untuk Firestore BASE_URL Configuration
// Jalankan sekali untuk initialize settings di Firestore

import { firestore } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Initialize BASE_URL setting di Firestore
 * Collection: settings
 * Document ID: 0
 * Field: base_url
 */
export const initializeBaseUrlSetting = async () => {
  try {
    const settingsRef = doc(firestore, 'settings', '0');

    // Cek apakah sudah ada
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      console.log('✅ Firestore settings found');
      console.log('📍 Current base_url:', data.base_url || 'NOT SET');
      return data;
    }

    // Buat document baru
    const defaultSettings = {
      base_url: 'https://uninfinite-shantae-vanadious.ngrok-free.dev',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: 'Dynamic BASE_URL for API calls (ngrok URL)',
    };

    await setDoc(settingsRef, defaultSettings);
    console.log('✅ Firestore settings created successfully');
    console.log('📍 BASE_URL set to:', defaultSettings.base_url);
    return defaultSettings;
  } catch (error) {
    console.error('❌ Error initializing Firestore settings:', error.message);
    // Don't throw - let app continue with default URL
    return {
      base_url: 'https://uninfinite-shantae-vanadious.ngrok-free.dev',
      error: error.message,
    };
  }
};

/**
 * Update BASE_URL di Firestore
 * Gunakan ini setiap kali ngrok URL berubah
 */
export const updateBaseUrl = async newBaseUrl => {
  try {
    if (!newBaseUrl || typeof newBaseUrl !== 'string') {
      throw new Error('Invalid BASE_URL');
    }

    const settingsRef = doc(firestore, 'settings', '0');

    await setDoc(
      settingsRef,
      {
        base_url: newBaseUrl.trim(),
        updated_at: new Date().toISOString(),
      },
      { merge: true },
    );

    console.log('✅ BASE_URL updated successfully');
    console.log('New BASE_URL:', newBaseUrl.trim());
    return newBaseUrl.trim();
  } catch (error) {
    console.error('❌ Error updating BASE_URL:', error);
    throw error;
  }
};

/**
 * Get current BASE_URL dari Firestore
 */
export const getCurrentBaseUrlFromFirestore = async () => {
  try {
    const settingsRef = doc(firestore, 'settings', '0');
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      const baseUrl = settingsDoc.data().base_url;
      console.log('Current BASE_URL:', baseUrl);
      return baseUrl;
    }

    console.log('⚠️ No BASE_URL found in Firestore');
    return null;
  } catch (error) {
    console.error('❌ Error fetching BASE_URL:', error);
    throw error;
  }
};

// Export untuk digunakan di development/testing
export default {
  initializeBaseUrlSetting,
  updateBaseUrl,
  getCurrentBaseUrlFromFirestore,
};

// CARA PENGGUNAAN:
//
// 1. Import di file yang perlu (misalnya App.js atau screen tertentu):
//    import { initializeBaseUrlSetting, updateBaseUrl } from './services/firestoreSetup';
//
// 2. Initialize (jalankan sekali saat pertama kali):
//    await initializeBaseUrlSetting();
//
// 3. Update saat ngrok restart:
//    await updateBaseUrl('https://new-ngrok-url.ngrok-free.dev');
//
// 4. Atau jalankan via React Native Debugger console:
//    import('./services/firestoreSetup').then(m => m.initializeBaseUrlSetting());
//    import('./services/firestoreSetup').then(m => m.updateBaseUrl('https://new-url.ngrok-free.dev'));
