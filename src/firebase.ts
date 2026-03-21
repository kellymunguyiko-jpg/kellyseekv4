import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBvYiXoXp2mXN6Mpaq258QqVPxGk8h1lQU",
  authDomain: "kellybox-febfa.firebaseapp.com",
  projectId: "kellybox-febfa",
  storageBucket: "kellybox-febfa.firebasestorage.app",
  messagingSenderId: "214725221173",
  appId: "1:214725221173:web:d78d419d1081d78ef00a7c",
  measurementId: "G-JF10Q41PE2",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export default app;
