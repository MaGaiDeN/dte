import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../config/firebase';
import { toast } from 'react-hot-toast';
import { MatchConfig, TIME_CONTROL_OPTIONS } from '../../components/MatchSettings/types/match';
import MatchSettings from '../../components/MatchSettings/MatchSettings';
import GameCount from '../../components/MatchSettings/GameCount';
import './Lobby.css';
import { User } from 'firebase/auth';

interface LobbyProps {
  challengeId?: string;
  challenge?: any;
}

const Lobby = ({ challengeId, challenge }: LobbyProps) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{ username: string } | null>(null);
  const [matchConfig, setMatchConfig] = useState<MatchConfig>({
    timeControl: TIME_CONTROL_OPTIONS.find(opt => opt.time === 3 && opt.increment === 2) || TIME_CONTROL_OPTIONS[0],
    numberOfGames: 3,
    rated: true,
    color: 'random'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
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

    return () => unsubscribe();
  }, [navigate]);

  const handleCreateChallenge = async () => {
    try {
      if (!auth.currentUser || !userData?.username) {
        toast.error('Debes iniciar sesión para crear un reto');
        navigate('/login');
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

      const challengeRef = await addDoc(collection(db, 'challenges'), challengeData);
      toast.success('¡Reto creado!');
      navigate(`/challenge/${challengeRef.id}`);
      
    } catch (error: any) {
      console.error('Error al crear reto:', error);
      toast.error('Error al crear el reto');
    }
  };

  const joinGame = async () => {
    if (!challengeId || !auth.currentUser) return;

    try {
      const availableColor = !challenge?.players.white ? 'white' : 'black';
      await updateDoc(doc(db, 'challenges', challengeId), {
        [`players.${availableColor}`]: auth.currentUser.uid
      });
      navigate(`/challenge/${challengeId}`);
    } catch (error) {
      toast.error('Error al unirse al juego');
    }
  };

  useEffect(() => {
    if (challenge && (!challenge.players.white || !challenge.players.black)) {
      joinGame();
    }
  }, [challenge, challengeId]);

  return (
    <div className="lobby-container">
      {challengeId ? (
        <div className="waiting-screen">
          <h2>Esperando jugadores...</h2>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="create-challenge">
          <h2>Crear nuevo reto</h2>
          <MatchSettings config={matchConfig} onChange={setMatchConfig} />
          <GameCount 
            selectedCount={matchConfig.numberOfGames} 
            onChange={(count) => setMatchConfig({...matchConfig, numberOfGames: count})} 
          />
          <button className="create-button" onClick={handleCreateChallenge}>
            Crear Reto
          </button>
        </div>
      )}
    </div>
  );
};

export default Lobby; 