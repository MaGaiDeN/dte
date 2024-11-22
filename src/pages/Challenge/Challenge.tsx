import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { doc, updateDoc, onSnapshot, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import './Challenge.css';
import { toast } from 'react-hot-toast';
import GameClock from '../../components/ChessClock/ChessClock';
import Header from '../../components/Header/Header';

// Definir la interfaz Challenge aquí ya que no la tenemos importada
interface Challenge {
  id: string;
  createdBy: string;
  creatorId: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  config: {
    timeControl: {
      time: number;
      increment: number;
    };
    numberOfGames: number;
    rated: boolean;
    color: 'random' | 'white' | 'black';
  };
  players: {
    white?: string;
    black?: string;
  };
  currentGame: number;
  drawOffer?: {
    offeredBy: string;
    offeredAt: number;
  };
}

interface ChallengeState {
  isCreator: boolean;
  gameStarted: boolean;
  timeWhite: number;
  timeBlack: number;
  currentGame: number;
  totalGames: number;
  challenge?: Challenge | null;
  isWhiteTurn: boolean;
  isLoading: boolean;
  error: string | null;
  players: {
    white: string | null;
    black: string | null;
    whiteUsername: string | null;
    blackUsername: string | null;
  };
}

const Challenge = () => {
  // Estados básicos del juego
  const [game, setGame] = useState(new Chess());
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estado del challenge
  const [challengeState, setChallengeState] = useState<ChallengeState>({
    isCreator: false,
    gameStarted: false,
    timeWhite: 0,
    timeBlack: 0,
    currentGame: 1,
    totalGames: 1,
    challenge: null,
    isWhiteTurn: true,
    isLoading: true,
    error: null,
    players: {
      white: null,
      black: null,
      whiteUsername: null,
      blackUsername: null
    }
  });

  const { challengeId } = useParams();
  const navigate = useNavigate();

  // Efecto para cargar el reto inicial
  useEffect(() => {
    if (!challengeId || !auth.currentUser) {
      setIsLoading(false);
      return;
    }

    const loadChallenge = async () => {
      try {
        const challengeRef = doc(db, 'challenges', challengeId);
        const unsubscribe = onSnapshot(challengeRef, (snapshot) => {
          if (!snapshot.exists()) {
            toast.error('El reto no existe');
            navigate('/lobby');
            return;
          }

          const data = snapshot.data();
          
          // Actualizar el estado del juego
          if (data.fen && data.fen !== game.fen()) {
            setGame(new Chess(data.fen));
          }

          // Determinar color del jugador
          if (auth.currentUser) {
            if (data.players?.white === auth.currentUser.uid) {
              setPlayerColor('white');
            } else if (data.players?.black === auth.currentUser.uid) {
              setPlayerColor('black');
            }
          }

          // Actualizar el turno
          const isMyTurn = auth.currentUser && (
            (data.currentTurn === 'white' && data.players?.white === auth.currentUser.uid) ||
            (data.currentTurn === 'black' && data.players?.black === auth.currentUser.uid)
          );
          setIsPlayerTurn(isMyTurn || false);

          // Actualizar estado del challenge
          setChallengeState(prevState => ({
            ...prevState,
            gameStarted: data.gameStarted || false,
            isCreator: data.createdBy === auth.currentUser?.uid,
            challenge: data as Challenge,
            players: {
              ...prevState.players,
              white: data.players?.white || null,
              black: data.players?.black || null
            }
          }));

          setIsLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading challenge:', error);
        toast.error('Error al cargar el reto');
        setIsLoading(false);
      }
    };

    loadChallenge();
  }, [challengeId]);

  // Efecto para manejar los tiempos
  useEffect(() => {
    if (!challengeState.gameStarted || !challengeState.challenge) return;
  }, [challengeState.gameStarted, challengeState.challenge]);

  useEffect(() => {
    const loadUsernames = async () => {
      if (challengeState.players.white) {
        const whiteDoc = await getDoc(doc(db, 'users', challengeState.players.white));
        if (whiteDoc.exists()) {
          setChallengeState(prev => ({
            ...prev,
            players: {
              ...prev.players,
              whiteUsername: whiteDoc.data().username
            }
          }));
        }
      }

      if (challengeState.players.black) {
        const blackDoc = await getDoc(doc(db, 'users', challengeState.players.black));
        if (blackDoc.exists()) {
          setChallengeState(prev => ({
            ...prev,
            players: {
              ...prev.players,
              blackUsername: blackDoc.data().username
            }
          }));
        }
      }
    };

    loadUsernames();
  }, [challengeState.players.white, challengeState.players.black]);

  if (isLoading) {
    return <div className="loading">Cargando reto...</div>;
  }

  // Manejar movimientos
  const handleMove = (sourceSquare: Square, targetSquare: Square, piece: string): boolean => {
    if (!isPlayerTurn || !challengeId || !auth.currentUser) return false;

    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1] === 'P' ? 'q' : undefined
      });
      
      if (!result) return false;

      // Actualizar Firebase en segundo plano
      updateDoc(doc(db, 'challenges', challengeId), {
        fen: newGame.fen(),
        lastMove: { from: sourceSquare, to: targetSquare, piece, color: playerColor },
        currentTurn: playerColor === 'white' ? 'black' : 'white',
        moves: arrayUnion({
          from: sourceSquare,
          to: targetSquare,
          piece: piece,
          san: result.san,
          timestamp: Date.now()
        })
      }).catch(error => {
        console.error('Error al realizar movimiento:', error);
        toast.error('Error al realizar el movimiento');
      });

      setGame(newGame);
      setIsPlayerTurn(false);
      return true;

    } catch (error) {
      console.error('Error al realizar movimiento:', error);
      toast.error('Error al realizar el movimiento');
      return false;
    }
  };

  const handleDrawOffer = async () => {
    if (!challengeId || !auth.currentUser) return;
    
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        drawOffer: {
          offeredBy: auth.currentUser.uid,
          offeredAt: Date.now()
        }
      });
      toast.success('Oferta de tablas enviada');
    } catch (error) {
      toast.error('Error al ofrecer tablas');
    }
  };

  const handleResign = async () => {
    if (!challengeId || !auth.currentUser) return;
    
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        status: 'completed',
        winner: playerColor === 'white' ? 'black' : 'white',
        result: playerColor === 'white' ? '0-1' : '1-0',
        endReason: 'resignation'
      });
      toast.success('Has abandonado la partida');
    } catch (error) {
      toast.error('Error al abandonar la partida');
    }
  };

  const handleTimeUpdate = async (color: 'white' | 'black', time: number) => {
    if (!challengeId) return;
    
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        [`timeLeft.${color}`]: time
      });
    } catch (error) {
      console.error('Error al actualizar el tiempo:', error);
    }
  };

  const handleTimeout = async (winner: 'white' | 'black') => {
    if (!challengeId) return;
    
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        status: 'completed',
        winner,
        result: winner === 'white' ? '1-0' : '0-1',
        endReason: 'timeout'
      });
    } catch (error) {
      toast.error('Error al finalizar la partida por tiempo');
    }
  };

  return (
    <div className="page-container">
      <Header />
      <div className="challenge-container">
        <div className="game-layout">
          {/* Panel izquierdo con controles de partida */}
          <div className="left-panel">
            {/* Jugador Negro */}
            <div className="player-box black">
              <div className="player-avatar">
                {/* Aquí podríamos agregar avatar del jugador */}
              </div>
              <div className="player-info">
                <span className="player-name">
                  {challengeState.players.blackUsername || 'Esperando...'}
                </span>
                <span className="player-rating">1500</span>
              </div>
              <GameClock
                timeInMinutes={challengeState.challenge?.config.timeControl.time || 0}
                increment={challengeState.challenge?.config.timeControl.increment || 0}
                isActive={game.turn() === 'b'}
                color="black"
                onTimeout={async () => await handleTimeout('white')}
                onTimeUpdate={(time) => handleTimeUpdate('black', time)}
              />
            </div>

            {/* Tablero */}
            <div className="board-container">
              <Chessboard 
                position={game.fen()}
                onPieceDrop={handleMove}
                boardOrientation={playerColor === 'black' ? 'black' : 'white'}
                customBoardStyle={{
                  borderRadius: '4px',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>

            {/* Jugador Blanco */}
            <div className="player-box white">
              <div className="player-avatar">
                {/* Aquí podríamos agregar avatar del jugador */}
              </div>
              <GameClock
                timeInMinutes={challengeState.challenge?.config.timeControl.time || 0}
                increment={challengeState.challenge?.config.timeControl.increment || 0}
                isActive={game.turn() === 'w'}
                color="white"
                onTimeout={async () => await handleTimeout('black')}
                onTimeUpdate={(time) => handleTimeUpdate('white', time)}
              />
              <div className="player-info">
                <span className="player-name">
                  {challengeState.players.whiteUsername || 'Esperando...'}
                </span>
                <span className="player-rating">1500</span>
              </div>
            </div>

            {/* Controles de partida (estilo Lichess) */}
            <div className="game-actions">
              <div className="primary-actions">
                <button 
                  className="action-btn draw-btn"
                  onClick={handleDrawOffer}
                  disabled={!isPlayerTurn}
                >
                  <i className="fas fa-handshake"></i>
                </button>
                <button 
                  className="action-btn resign-btn"
                  onClick={handleResign}
                >
                  <i className="fas fa-flag"></i>
                </button>
              </div>
              <div className="secondary-actions">
                <button className="action-btn">
                  <i className="fas fa-undo"></i>
                </button>
                <button className="action-btn">
                  <i className="fas fa-forward"></i>
                </button>
                <button className="action-btn">
                  <i className="fas fa-cog"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="right-panel">
            <div className="game-info-header">
              <div className="time-control">
                <i className="fas fa-clock"></i>
                <span>{`${challengeState.challenge?.config.timeControl.time}+${challengeState.challenge?.config.timeControl.increment}`}</span>
              </div>
              <div className="game-type">
                {challengeState.challenge?.config.rated ? 
                  <i className="fas fa-trophy" title="Partida clasificatoria"></i> :
                  <i className="fas fa-handshake" title="Partida amistosa"></i>
                }
              </div>
            </div>

            {/* Aquí podríamos agregar el historial de movimientos */}
            <div className="moves-history">
              {/* Lista de movimientos */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge; 