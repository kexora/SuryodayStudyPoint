import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// @ts-ignore
const env = import.meta.env || {};

// User's official Firebase configuration for Suryoday Education
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyATm8eBmNQPH3NtX4Cf8ipqNueYOpDGi3A",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "suryodayeducation.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "suryodayeducation",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "suryodayeducation.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1050978757719",
  appId: env.VITE_FIREBASE_APP_ID || "1:1050978757719:web:2ce7e5aa11e5133ca5c712",
};

// Clear any stale local cache pointing to old temporary project
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('custom_firebase_config');
    if (saved && (saved.includes('gen-lang-client') || !saved.includes('suryodayeducation'))) {
      localStorage.removeItem('custom_firebase_config');
    }
  } catch (e) {
    // ignore
  }
}

export function saveCustomFirebaseConfig(config: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('custom_firebase_config', JSON.stringify(config));
    window.location.reload();
  }
}

export function resetCustomFirebaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('custom_firebase_config');
    window.location.reload();
  }
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  experimentalAutoDetectLongPolling: true,
});
export const storage = getStorage(app);
