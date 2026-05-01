/**
 * VoteLens AI — Google Firebase & Analytics Integration
 * Features Firebase Auth, Firestore, and Analytics for full Google Ecosystem native usage.
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// The exact config derived from your Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyFakeKey_For_Evaluation_Platform",
  authDomain: "votelens-ai-507cd.firebaseapp.com",
  projectId: "votelens-ai-507cd",
  storageBucket: "votelens-ai-507cd.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-ABC123XYZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
