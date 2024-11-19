import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth.css';
import './Login.css';
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/lobby');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/lobby');
    } catch (error) {
      console.error('Error con Google login:', error);
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

        <h2>Ingresa tu email y contraseña</h2>
        <p className="auth-subtitle">
          Esto te permite iniciar sesión en cualquier dispositivo
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
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
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-continue">
            Continuar
          </button>
        </form>

        <div className="auth-divider">O</div>

        <div className="social-buttons">
          <button className="btn-social google" onClick={handleGoogleLogin}>
            <i className="fab fa-google"></i>
            Continuar con Google
          </button>
          <button className="btn-social apple">
            <i className="fab fa-apple"></i>
            Continuar con Apple
          </button>
        </div>

        <div className="auth-links">
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          <Link to="/register">¿No tienes una cuenta? Regístrate</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 