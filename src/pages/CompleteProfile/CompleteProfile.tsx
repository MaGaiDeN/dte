import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { updateProfile } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import './CompleteProfile.css';
import Header from '../../components/Header/Header';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { uid, email, photoURL } = location.state || {};
  const [username, setUsername] = useState('');

  const validateUsername = async (username: string) => {
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(username)) {
      return false;
    }
    const usersRef = doc(db, 'usernames', username.toLowerCase());
    const docSnap = await getDoc(usersRef);
    return !docSnap.exists();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const isValid = await validateUsername(username);
      if (!isValid) {
        toast.error('Nombre de usuario no válido o ya está en uso');
        return;
      }

      // Guardar username en colección de usernames
      await setDoc(doc(db, 'usernames', username.toLowerCase()), {
        uid: uid
      });

      // Guardar datos del usuario
      await setDoc(doc(db, 'users', uid), {
        username,
        email,
        createdAt: new Date(),
        rating: 1200,
        photoURL: photoURL || null
      });

      // Actualizar perfil de Firebase Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: username
        });
      }

      toast.success('¡Perfil completado!');
      navigate('/lobby');
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      toast.error('Error al guardar el perfil');
    }
  };

  return (
    <div className="page-container">
      <Header />
      <div className="auth-container">
        <div className="auth-card">
          <h2>Completa tu perfil</h2>
          <p className="auth-subtitle">
            Solo necesitamos un nombre de usuario para continuar
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={15}
                  pattern="^[a-zA-Z0-9_]+$"
                  title="El nombre de usuario debe tener entre 3 y 15 caracteres y solo puede contener letras, números y guiones bajos"
                />
              </div>
            </div>

            <div className="form-info">
              <p>Email: {email}</p>
            </div>

            <button type="submit" className="btn-continue">
              Completar perfil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile; 