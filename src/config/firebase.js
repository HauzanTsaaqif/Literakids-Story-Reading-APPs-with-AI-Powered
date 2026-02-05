import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: 'AIzaSyBkumMHHOZRLHZABIq9oE-Qmso6TuUfrH0',
  authDomain: 'literakids-a05b3.firebaseapp.com',
  projectId: 'literakids-a05b3',
  storageBucket: 'literakids-a05b3.firebasestorage.app',
  messagingSenderId: '605290540376',
  appId: '1:605290540376:android:62a0180f4defd2b2ca092d',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
export default app;
