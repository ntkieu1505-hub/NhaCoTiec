import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: "AIzaSyCTOQWpQwoua-Zy3aPMHH8BExrYdSNdgfg",
  authDomain: "nhacotiec-137e3.firebaseapp.com",
  projectId: "nhacotiec-137e3",
  storageBucket: "nhacotiec-137e3.firebasestorage.app",
  messagingSenderId: "5977472879",
  appId: "1:5977472879:web:e9ba592a1670a88edbb29a",
  measurementId: "G-Z2HW7GTQZK"
};

// Initialize Firebase once
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Google Analytics if supported by environment
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported or blocked by browser adblock
  });
}
