// @ts-ignore
import { useState, useEffect } from 'react';
import { MatchConfig, TIME_CONTROL_OPTIONS } from '../../components/MatchSettings/types/match';
import TimeControl from '../../components/TimeControl/TimeControl';
import MatchSettings from '../../components/MatchSettings/MatchSettings';
import './Lobby.css';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';


const Lobby = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Iniciando efecto de autenticación en Lobby');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Estado de autenticación cambiado:', !!user);
      if (!user) {
        console.log('Usuario no autenticado, redirigiendo a login');
        navigate('/login');
      }
    });

    return () => {
      console.log('Limpiando efecto de autenticación en Lobby');
      unsubscribe();
    };
  }, [navigate]);

  const [matchConfig, setMatchConfig] = useState<MatchConfig>({
    timeControl: TIME_CONTROL_OPTIONS.find(opt => opt.time === 3 && opt.increment === 2) || TIME_CONTROL_OPTIONS[0],
    numberOfGames: 3,
    rated: true,
    color: 'random'
  });

  const handleCreateChallenge = async () => {
    console.log('1. Configuración del match:', matchConfig);
    console.log('2. Tiempo seleccionado:', {
      minutos: matchConfig.timeControl.time,
      incremento: matchConfig.timeControl.increment
    });

    try {
      if (!auth.currentUser) {
        console.log('3A. Usuario no autenticado');
        toast.error('Debes iniciar sesión para crear un reto');
        navigate('/login');
        return;
      }

      console.log('3B. Creando documento del reto con config:', {
        tiempo: matchConfig.timeControl.time,
        incremento: matchConfig.timeControl.increment,
        configCompleta: matchConfig
      });

      const challengeRef = await addDoc(collection(db, 'challenges'), {
        config: matchConfig,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        creatorId: auth.currentUser.uid,
        status: 'waiting',
        players: {},
        currentGame: 1,
        matchScore: { white: 0, black: 0 },
        timeWhite: matchConfig.timeControl.time * 60,
        timeBlack: matchConfig.timeControl.time * 60,
        timeControl: {
          time: matchConfig.timeControl.time,
          increment: matchConfig.timeControl.increment
        }
      });

      console.log('4. Reto creado:', {
        id: challengeRef.id,
        config: matchConfig
      });

      const challengeLink = `${window.location.origin}/challenge/${challengeRef.id}`;
      console.log('5. Link generado:', challengeLink);
      
      await navigator.clipboard.writeText(challengeLink);
      console.log('6. Link copiado al portapapeles');
      
      console.log('7. Intentando navegar a:', `/challenge/${challengeRef.id}`);
      navigate(`/challenge/${challengeRef.id}`);
      
      toast.success('Reto creado! El enlace se ha copiado al portapapeles');
      console.log('8. Navegación y toast completados');

    } catch (error) {
      console.error('Error en handleCreateChallenge:', error);
      toast.error('Error al crear el reto');
    }
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
          Logout
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