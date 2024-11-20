import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const validateUsername = async (username: string) => {
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(username)) {
      return false;
    }
    
    // Verificar si el username ya existe
    const usersRef = doc(db, 'usernames', username.toLowerCase());
    const docSnap = await getDoc(usersRef);
    return !docSnap.exists();
  };

  const saveUserData = async (uid: string, username: string, email: string, photoURL?: string) => {
    try {
      // Guardar el username en una colección separada para búsqueda rápida
      await setDoc(doc(db, 'usernames', username.toLowerCase()), {
        uid: uid
      });

      // Guardar los datos del usuario
      await setDoc(doc(db, 'users', uid), {
        username,
        email,
        createdAt: new Date(),
        rating: 1200,
        photoURL: photoURL || null
      });
      
      await updateProfile(auth.currentUser!, {
        displayName: username,
        photoURL: photoURL || null
      });
    } catch (error) {
      console.error('Error guardando datos de usuario:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const isValidUsername = await validateUsername(formData.username);
      if (!isValidUsername) {
        toast.error('Nombre de usuario no válido o ya está en uso');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      await saveUserData(
        userCredential.user.uid, 
        formData.username, 
        formData.email
      );
      
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/lobby');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email ya está registrado');
      } else {
        toast.error('Error al crear la cuenta');
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Generar username único basado en el email
      let username = result.user.email?.split('@')[0] || '';
      let isValid = await validateUsername(username);
      let counter = 1;
      
      while (!isValid && counter < 100) {
        username = `${result.user.email?.split('@')[0]}_${counter}`;
        isValid = await validateUsername(username);
        counter++;
      }

      if (!isValid) {
        toast.error('No se pudo generar un nombre de usuario único');
        return;
      }

      await saveUserData(
        result.user.uid, 
        username, 
        result.user.email!, 
        result.user.photoURL || undefined
      );
      
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/lobby');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Registro cancelado');
      } else {
        toast.error('Error al registrarse con Google');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="back-button">
          <i className="fas fa-arrow-left"></i>
        </Link>

        <Link to="/" className="logo">
          <i className="fas fa-chess-knight logo-icon"></i>
          <div className="logo-text">
            <span className="logo-chess">CHESS</span>
            <span className="logo-match">MATCH</span>
          </div>
        </Link>

        <h2>Crear cuenta</h2>
        <p className="auth-subtitle">
          Este es el nombre que verán tus amigos y otros jugadores
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-user"></i>
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                minLength={3}
                maxLength={15}
                pattern="^[a-zA-Z0-9_]+$"
                title="El nombre de usuario debe tener entre 3 y 15 caracteres y solo puede contener letras, números y guiones bajos"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-continue">
            Crear cuenta
          </button>
        </form>

        <div className="auth-divider">O</div>

        <div className="social-buttons">
          <button className="btn-social google" onClick={handleGoogleSignup}>
            <i className="fab fa-google"></i>
            Continuar con Google
          </button>
          <button className="btn-social apple">
            <i className="fab fa-apple"></i>
            Continuar con Apple
          </button>
        </div>

        <div className="auth-links">
          <Link to="/login">¿Ya tienes una cuenta? Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 