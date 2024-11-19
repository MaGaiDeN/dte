import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el email de recuperación
    console.log('Recuperar contraseña para:', email);
    setIsSent(true);
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
          <Link to="/login" className="back-button">
            <i className="fas fa-arrow-left"></i>
          </Link>

          {!isSent ? (
            <>
              <h2>Recuperar contraseña</h2>
              <p className="auth-subtitle">
                Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
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

                <button type="submit" className="btn-continue">
                  Enviar instrucciones
                </button>
              </form>
            </>
          ) : (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <h2>¡Email enviado!</h2>
              <p>
                Hemos enviado las instrucciones para restablecer tu contraseña a {email}
              </p>
              <p className="small">
                Si no recibes el email en unos minutos, revisa tu carpeta de spam
              </p>
              <Link to="/login" className="btn-continue">
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword; 