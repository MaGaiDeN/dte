import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { CacheService } from '../utils/cache-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface UserData {
  username: string;
  rating: number;
  photoURL: string | null;
  // ... otros campos
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const cache = CacheService.getInstance();

  const fetchUserData = async (uid: string) => {
    // Intentar obtener del caché primero
    const cachedData = cache.get<UserData>(`userData_${uid}`);
    if (cachedData) {
      return cachedData;
    }

    // Si no está en caché, obtener de Firestore
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data() as UserData;
      // Guardar en caché por 5 minutos
      cache.set(`userData_${uid}`, data, 5 * 60 * 1000);
      return data;
    }
    return null;
  };

  const refreshUserData = async () => {
    if (currentUser) {
      const data = await fetchUserData(currentUser.uid);
      setUserData(data);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const data = await fetchUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
        cache.clear(); // Limpiar caché al cerrar sesión
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 