import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// @ts-ignore
const env = import.meta.env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyATm8eBmNQPH3NtX4Cf8ipqNueYOpDGi3A",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "suryodayeducation.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "suryodayeducation",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "suryodayeducation.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1050978757719",
  appId: env.VITE_FIREBASE_APP_ID || "1:1050978757719:web:2ce7e5aa11e5133ca5c712"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app);


