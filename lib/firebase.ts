// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// 環境変数から読み込む（開発環境用のフォールバック値あり）
// 改行文字やスペースを削除するため.trim()を使用
const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCyjOZ0BLsVrq49-O_ihwMq1kO9ZO_Aoeg").trim(),
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sirius-cf574.firebaseapp.com").trim(),
  projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sirius-cf574").trim(),
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sirius-cf574.firebasestorage.app").trim(),
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "753671151982").trim(),
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:753671151982:web:457a1dd3d208b39b1ca17f").trim()
};

// Initialize Firebase
// Check if Firebase has already been initialized to avoid re-initialization in Next.js
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export default app;

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Cloud Storage
export const storage = getStorage(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
