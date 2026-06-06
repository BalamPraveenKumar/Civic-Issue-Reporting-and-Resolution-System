import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_IBVoBIS2lytgnUDQTk7EMTdlC-Mq8S0",
  authDomain: "civic-issue-reporting-sy-4eb32.firebaseapp.com",
  projectId: "civic-issue-reporting-sy-4eb32",
  storageBucket: "civic-issue-reporting-sy-4eb32.firebasestorage.app",
  messagingSenderId: "487305784049",
  appId: "1:487305784049:web:7179935cfc9163df571750",
  measurementId: "G-BNHFQDTKZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional, checks for window support for SSR compatibility)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Auth
export const auth = getAuth(app);

export { app, analytics };
