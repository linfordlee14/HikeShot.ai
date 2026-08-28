import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB73fyFWHOkDDyqaOLil40JqnGAF4Bs6dY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nth-voyager-dz2vd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nth-voyager-dz2vd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nth-voyager-dz2vd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "853865233647",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:853865233647:web:1c08a3815b0e51020b6f1a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

export const app = initializeApp(firebaseConfig);

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-hikeshot-245d601e-9876-49ba-bc65-6c7cfa4b33fe";
export const db = databaseId === "(default)" ? getFirestore(app) : getFirestore(app, databaseId);
export const storage = getStorage(app);

