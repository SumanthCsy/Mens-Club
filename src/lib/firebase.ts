// @/lib/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0qaTh3tCDSxA90S4kIwAzzMqLFejlcQE",
  authDomain: "mensclubkpm.firebaseapp.com",
  projectId: "mensclubkpm",
  storageBucket: "mensclubkpm.firebasestorage.app",
  messagingSenderId: "402330619015",
  appId: "1:402330619015:web:14cd3eee479c475ab6bc22",
  measurementId: "G-WZ3YXQQ7Q7"
};

// Initialize Firebase
// Using getApps() and getApp() to prevent re-initialization in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics only on the client side
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, analytics };
