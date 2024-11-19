import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth.css';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registro:', { username, email, password, acceptTerms });
  };

  return (
    <>
      <header className="main-header">
        <Link to="/" className="logo">
          <i className="fas fa-chess-knight logo-icon"></i>
          <div className="logo-text">
            <span className="logo-chess">CHESS</span>
            <span className="logo-match">MATCH</span>
          </div>
        </Link>
        <div className="auth-buttons">
          <Link to="/register" className="btn-signup">Sign Up</Link>
          <Link to="/login" className="btn-login">Log In</Link>
        </div>
      </header>
      <div className="auth-container">
        <div className="auth-card">
          <Link to="/" className="back-button">
            <i className="fas fa-arrow-left"></i>
          </Link>

          <div className="logo">
            <i className="fas fa-chess-knight logo-icon"></i>
            <div className="logo-text">
              <span className="logo-chess">CHESS</span>
              <span className="logo-match">MATCH</span>
            </div>
          </div>

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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

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

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span>Mantenerme actualizado con consejos y ofertas especiales</span>
              </label>
            </div>

            <button type="submit" className="btn-continue">
              Continuar
            </button>
          </form>

          <div className="auth-divider">O</div>

          <div className="social-buttons">
            <button className="btn-social google">
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
    </>
  );
};

export default Register; 