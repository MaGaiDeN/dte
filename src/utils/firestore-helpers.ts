import { updateDoc, doc, addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

export const throttleFirestore = (fn: Function, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
    return Promise.resolve();
  };
};

// Uso en Challenge.tsx
const updateGame = throttleFirestore(async (newFen: string, challengeId: string) => {
  if (!challengeId) return;
  
  try {
    await updateDoc(doc(db, 'challenges', challengeId), {
      fen: newFen
    });
  } catch (error) {
    console.error('Error updating game:', error);
  }
}, 2000); // 2 segundos entre actualizaciones 

interface ChallengeData {
  createdBy: string;
  creatorUsername: string;
  createdAt: any; // FirebaseServerTimestamp
  config: {
    timeControl: any;
    numberOfGames: number;
    rated: boolean;
    color: string;
  };
  status: string;
  currentGame: number;
  currentTurn: string;
  fen: string;
  gameStarted: boolean;
  players: {
    white: null | string;
    black: null | string;
  };
  timeLeft: {
    white: number;
    black: number;
  };
}

export const createChallenge = async (challengeData: ChallengeData, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const docRef = await addDoc(collection(db, 'challenges'), challengeData);
      console.log(`Reto creado exitosamente en el intento ${attempt + 1}`);
      return docRef;
    } catch (error: any) {
      if (error.code === 'resource-exhausted' && attempt < maxRetries - 1) {
        console.log(`Intento ${attempt + 1} fallido, reintentando en ${Math.pow(2, attempt)} segundos...`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
      console.error('Error al crear el reto:', error);
      throw error;
    }
  }
};

// Función mejorada de throttle con cola de operaciones
const createThrottledQueue = (delay: number) => {
  let queue: Function[] = [];
  let lastExecuted = 0;

  const processQueue = async () => {
    const now = Date.now();
    if (queue.length > 0 && now - lastExecuted >= delay) {
      const fn = queue.shift();
      if (fn) {
        lastExecuted = now;
        await fn();
      }
    }
    
    if (queue.length > 0) {
      setTimeout(processQueue, delay);
    }
  };

  return (fn: Function) => {
    return new Promise((resolve) => {
      queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          console.error('Error en operación:', error);
          resolve(null);
        }
      });
      
      if (queue.length === 1) {
        processQueue();
      }
    });
  };
};