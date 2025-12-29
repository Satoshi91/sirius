// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyjOZ0BLsVrq49-O_ihwMq1kO9ZO_Aoeg",
  authDomain: "sirius-cf574.firebaseapp.com",
  projectId: "sirius-cf574",
  storageBucket: "sirius-cf574.firebasestorage.app",
  messagingSenderId: "753671151982",
  appId: "1:753671151982:web:457a1dd3d208b39b1ca17f"
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
