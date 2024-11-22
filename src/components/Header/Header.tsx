import { Link } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  console.log('Renderizando Header');
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="main-header">
      <Link to="/" className="logo">
        <i className="fas fa-chess-knight logo-icon"></i>
        <div className="logo-text">
          <span className="logo-chess">CHESS</span>
          <span className="logo-match">MATCH</span>
        </div>
      </Link>
      <div className="auth-buttons">
        {currentUser ? (
          <button onClick={handleLogout} className="btn-logout">
            <i className="fas fa-sign-out-alt"></i>
            Cerrar sesión
          </button>
        ) : (
          <>
            <Link to="/register" className="btn-signup">Registrarse</Link>
            <Link to="/login" className="btn-login">Iniciar sesión</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header; 