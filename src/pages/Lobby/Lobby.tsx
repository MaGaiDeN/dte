import { useState, useEffect } from 'react';
import { MatchConfig, DEFAULT_MATCH_CONFIG } from '../../components/MatchSettings/types/match';
import TimeControl from '../../components/TimeControl/TimeControl';
import MatchSettings from '../../components/MatchSettings/MatchSettings';
import './Lobby.css';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { TIME_CONTROL_OPTIONS } from '../../components/TimeControl/constants.ts';


const Lobby = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Si no hay usuario autenticado, redirigir al login
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const [matchConfig, setMatchConfig] = useState<MatchConfig>(DEFAULT_MATCH_CONFIG);

  const handleCreateChallenge = () => {
    console.log('Creando reto:', matchConfig);
    // Aquí iría la lógica para crear el reto
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleConfigChange = (newConfig: MatchConfig) => {
    setMatchConfig(newConfig);
  };

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <Link to="/" className="logo">
          <i className="fas fa-chess-knight logo-icon"></i>
          <div className="logo-text">
            <span className="logo-chess">CHESS</span>
            <span className="logo-match">MATCH</span>
          </div>
        </Link>
        <button onClick={handleLogout} className="btn-logout">
          <i className="fas fa-sign-out-alt"></i>
          Cerrar sesión
        </button>
      </div>

      <div className="lobby-content">
        <div className="lobby-card">
          <h2>Crear Match Personalizado</h2>
          
          <TimeControl
            options={TIME_CONTROL_OPTIONS}
            selected={matchConfig.timeControl}
            onSelect={(timeControl) => setMatchConfig({...matchConfig, timeControl})}
          />

          <div className="game-count-section">
            <h3>Número de Partidas</h3>
            <div className="game-count-options">
              {[1, 3, 5, 10, 20].map((count) => (
                <button
                  key={count}
                  className={`game-count-button ${matchConfig.numberOfGames === count ? 'active' : ''}`}
                  onClick={() => setMatchConfig({...matchConfig, numberOfGames: count})}
                >
                  {count === 1 ? '1 partida' : `${count} partidas`}
                </button>
              ))}
            </div>
          </div>

          <MatchSettings
            config={matchConfig}
            onChange={handleConfigChange}
          />

          <button 
            className="btn-create-challenge"
            onClick={handleCreateChallenge}
          >
            Crear Reto
          </button>
        </div>
      </div>

      <div className="lobby-footer">
        <button className="btn-puzzles">
          <i className="fas fa-puzzle-piece"></i>
          Resolver puzzles
        </button>
      </div>
    </div>
  );
};

export default Lobby; 