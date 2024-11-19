import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcGX1V06Iox4rkwOm9BW2gfC1-jj8TiSs",
  authDomain: "chessmatch-b38ef.firebaseapp.com",
  projectId: "chessmatch-b38ef",
  storageBucket: "chessmatch-b38ef.firebasestorage.app",
  messagingSenderId: "293162008011",
  appId: "1:293162008011:web:e605313c7055f1ce784a4e",
  measurementId: "G-2V8DL9QX5J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app); 