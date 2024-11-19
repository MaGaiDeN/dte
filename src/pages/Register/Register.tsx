import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/lobby');
    } catch (error) {
      console.error('Error al registrar:', error);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/lobby');
    } catch (error) {
      console.error('Error con Google signup:', error);
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

        <h2>Elige un nombre de usuario</h2>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-continue">
            Continuar
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