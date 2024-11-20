import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Home from './pages/Home';
import Board from './components/Board/Board';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Lobby from './pages/Lobby/Lobby';
import Challenge from './pages/Challenge/Challenge';
import CompleteProfile from './pages/CompleteProfile/CompleteProfile';
import './styles/Home.css';
import './styles/Board.css';
import './App.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route index element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Rutas protegidas */}
          <Route path="/lobby" element={
            <ProtectedRoute>
              <Lobby />
            </ProtectedRoute>
          } />
          
          <Route path="/challenge/:challengeId" element={
            <ProtectedRoute>
              <Challenge />
            </ProtectedRoute>
          } />

          <Route path="/play">
            <Route path="computer" element={<Board />} />
            <Route path="online" element={
              <ProtectedRoute>
                <Board />
              </ProtectedRoute>
            } />
            <Route path="friend" element={
              <ProtectedRoute>
                <Board />
              </ProtectedRoute>
            } />
            <Route path="puzzle" element={<Board isPuzzle={true} />} />
          </Route>

          <Route path="/complete-profile" element={<CompleteProfile />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;