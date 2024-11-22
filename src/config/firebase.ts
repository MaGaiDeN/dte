import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, initializeFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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
const db = initializeFirestore(app, {
  cacheSizeBytes: 5242880,
  experimentalForceLongPolling: true,
});

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export const analytics = getAnalytics(app);

enableIndexedDbPersistence(db).catch((err) => {
  console.error('Error enabling persistence:', err);
});

export { db };