import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, initializeFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcGX1V06Iox4rkwOm9BW2gfC1-jj8TiSs",
  authDomain: "chessmatch-b38ef.firebaseapp.com",
  projectId: "chessmatch-b38ef",
  storageBucket: "chessmatch-b38ef.firebasestorage.app",
  messagingSenderId: "293162008011",
  appId: "1:293162008011:web:e605313c7055f1ce784a4e",
  measurementId: "G-2V8DL9QX5J"
};

// Inicializar antes de cualquier otra operación
const app = initializeApp(firebaseConfig);

// Configurar Auth primero
export const auth = getAuth(app);
connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

// Configurar Firestore después
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
connectFirestoreEmulator(db, 'localhost', 9090);

console.log('🔧 Usando emuladores - Auth: 9099, Firestore: 9090');

// Habilitar persistencia después de conectar al emulador
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('La persistencia falló: múltiples pestañas abiertas');
  } else if (err.code === 'unimplemented') {
    console.warn('El navegador no soporta persistencia');
  }
});

// Eliminar analytics para desarrollo local
// export const analytics = getAnalytics(app);

export { db };