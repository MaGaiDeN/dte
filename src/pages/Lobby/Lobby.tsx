// @ts-ignore
import { useState, useEffect } from 'react';
import { MatchConfig, TIME_CONTROL_OPTIONS } from '../../components/MatchSettings/types/match';
import TimeControl from '../../components/TimeControl/TimeControl';
import MatchSettings from '../../components/MatchSettings/MatchSettings';
import './Lobby.css';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';
import { getDoc, doc } from 'firebase/firestore';
import Header from '../../components/Header/Header';


const Lobby = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{username: string} | null>(null);

  useEffect(() => {
    console.log('Iniciando efecto de autenticación en Lobby');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Estado de autenticación cambiado:', !!user);
      if (!user) {
        console.log('Usuario no autenticado, redirigiendo a login');
        navigate('/login');
      }
    });

    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as {username: string});
        }
      }
    };
    
    fetchUserData();

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
    try {
      if (!auth.currentUser) {
        toast.error('Debes iniciar sesión para crear un reto');
        navigate('/login');
        return;
      }

      if (!userData?.username) {
        toast.error('Error: No se pudo obtener la información del usuario');
        return;
      }

      const initialTime = matchConfig.timeControl.time * 60;
      
      const challengeData = {
        createdBy: auth.currentUser.uid,
        creatorUsername: userData.username,
        createdAt: serverTimestamp(),
        config: matchConfig,
        status: 'waiting',
        currentGame: 1,
        gameStarted: false,
        timeLeft: {
          white: initialTime,
          black: initialTime
        },
        players: {
          white: null,
          black: null
        },
        currentTurn: 'white',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      };

      console.log('Intentando crear reto con datos:', challengeData);

      const challengeRef = await addDoc(collection(db, 'challenges'), challengeData);
      
      console.log('Reto creado con ID:', challengeRef.id);
      
      toast.success('¡Reto creado! Redirigiendo...');
      navigate(`/challenge/${challengeRef.id}`);

    } catch (error: any) {
      console.error('Error detallado en handleCreateChallenge:', error);
      if (error.code === 'permission-denied') {
        toast.error('Error de permisos. Por favor, verifica tu sesión');
      } else {
        toast.error('Error al crear el reto. Por favor, inténtalo de nuevo');
      }
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
    <div className="page-container">
      <Header />
      <div className="lobby-content">
        <div className="lobby-card">
          <h2>Crear Match Personalizado</h2>
          <button onClick={handleLogout}>Cerrar Sesión</button>
          
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