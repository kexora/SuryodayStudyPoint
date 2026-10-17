import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseAppletConfig from "../../firebase-applet-config.json";

// @ts-ignore
const env = import.meta.env || {};

// Check if user has set custom Firebase configuration (e.g. suryodayeducation)
let customConfig: any = null;
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('custom_firebase_config');
    if (saved) {
      customConfig = JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to parse custom_firebase_config:", e);
  }
}

export const firebaseConfig = {
  apiKey: customConfig?.apiKey || env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: customConfig?.authDomain || env.VITE_FIREBASE_AUTH_DOMAIN || (customConfig?.projectId ? `${customConfig.projectId}.firebaseapp.com` : firebaseAppletConfig.authDomain),
  projectId: customConfig?.projectId || env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: customConfig?.storageBucket || env.VITE_FIREBASE_STORAGE_BUCKET || (customConfig?.projectId ? `${customConfig.projectId}.firebasestorage.app` : firebaseAppletConfig.storageBucket),
  messagingSenderId: customConfig?.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: customConfig?.appId || env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
};

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
