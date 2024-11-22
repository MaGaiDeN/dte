import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { doc, updateDoc, onSnapshot, arrayUnion, getDoc, query } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import './Challenge.css';
import { toast } from 'react-hot-toast';
import GameClock from '../../components/ChessClock/ChessClock';
import Header from '../../components/Header/Header';
import 'bootstrap/dist/css/bootstrap.min.css';

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

  // Añade estos estados
  const [gameStarted, setGameStarted] = useState(false);
  const [initialTime, setInitialTime] = useState<number>(0);

  // Efecto para cargar el reto inicial
  useEffect(() => {
    console.log('Iniciando efecto con challengeId:', challengeId);
    if (!challengeId) return;

    const loadChallenge = async () => {
      try {
        const challengeRef = doc(db, 'challenges', challengeId);
        const challengeDoc = await getDoc(challengeRef);
        
        if (!challengeDoc.exists()) {
          toast.error('Reto no encontrado');
          navigate('/');
          return;
        }

        const data = challengeDoc.data();
        console.log('Datos del reto cargados:', data);

        // Calcular tiempo inicial en segundos
        const timeInSeconds = (data.config.timeControl.time || 0) * 60;
        setInitialTime(timeInSeconds);

        // Actualizar estado del challenge
        setChallengeState(prev => ({
          ...prev,
          challenge: {
            id: challengeId,
            ...data
          } as Challenge,
          timeWhite: timeInSeconds,
          timeBlack: timeInSeconds,
          isLoading: false,
          gameStarted: data.gameStarted || false
        }));

        // Determinar el color del jugador
        if (auth.currentUser) {
          const isWhite = data.players.white === auth.currentUser.uid;
          const isBlack = data.players.black === auth.currentUser.uid;
          
          if (isWhite) {
            setPlayerColor('white');
          } else if (isBlack) {
            setPlayerColor('black');
          } else if (!data.players.white || !data.players.black) {
            // Si hay un espacio libre, unirse automáticamente
            const availableColor = !data.players.white ? 'white' : 'black';
            await joinGame(availableColor);
          }
        }

        setGameStarted(data.gameStarted || false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error cargando el reto:', error);
        setIsLoading(false);
      }
    };

    loadChallenge();

    // Suscribirse a cambios en tiempo real
    const unsubscribe = onSnapshot(
      doc(db, 'challenges', challengeId),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        
        setGameStarted(data.gameStarted || false);
        
        if (data.timeLeft) {
          setChallengeState(prev => ({
            ...prev,
            timeWhite: data.timeLeft.white,
            timeBlack: data.timeLeft.black
          }));
        }
      }
    );

    return () => unsubscribe();
  }, [challengeId]);

  // Función para unirse al juego
  const joinGame = async (color: 'white' | 'black') => {
    if (!challengeId || !auth.currentUser) return;

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        [`players.${color}`]: auth.currentUser.uid,
        ...(color === 'black' ? { gameStarted: true } : {})
      });

      setPlayerColor(color);
      toast.success('Te has unido al juego');
    } catch (error) {
      console.error('Error al unirse al juego:', error);
      toast.error('Error al unirse al juego');
    }
  };

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

  useEffect(() => {
    console.log('Estado del challenge:', {
      isLoading,
      challengeState,
      playerColor,
      game: game?.fen()
    });
  }, [isLoading, challengeState, playerColor, game]);

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
    <div className="challenge-container">
      <Header />
      <div className="challenge-content container-fluid pt-5">
        <div className="row">
          {/* Panel izquierdo */}
          <div className="col-12 col-lg-8">
            {/* Jugador Negro */}
            <div className="player-box black mb-3">
              <div className="row align-items-center w-100">
                <div className="col-auto">
                  <div className="player-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <div className="col">
                  <div className="player-info">
                    <span className="player-name text-white">
                      {challengeState.players.blackUsername || 'Esperando...'}
                    </span>
                    <span className="player-rating">
                      <i className="fas fa-star me-1"></i>1500
                    </span>
                  </div>
                </div>
                <div className="col-auto">
                  <GameClock
                    timeInMinutes={challengeState.challenge?.config.timeControl.time || 0}
                    increment={challengeState.challenge?.config.timeControl.increment || 0}
                    isActive={gameStarted && game.turn() === 'b'}
                    color="black"
                    onTimeout={async () => await handleTimeout('white')}
                    onTimeUpdate={(time) => handleTimeUpdate('black', time)}
                    remainingTime={challengeState.timeBlack}
                  />
                </div>
              </div>
            </div>

            {/* Tablero */}
            <div className="board-wrapper mb-3">
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
            </div>

            {/* Jugador Blanco */}
            <div className="player-box white mb-3">
              <div className="row align-items-center w-100">
                <div className="col-auto order-3">
                  <div className="player-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <div className="col order-2">
                  <div className="player-info text-end">
                    <span className="player-name text-white">
                      {challengeState.players.whiteUsername || 'Esperando...'}
                    </span>
                    <span className="player-rating">
                      <i className="fas fa-star me-1"></i>1500
                    </span>
                  </div>
                </div>
                <div className="col-auto order-1">
                  <GameClock
                    timeInMinutes={challengeState.challenge?.config.timeControl.time || 0}
                    increment={challengeState.challenge?.config.timeControl.increment || 0}
                    isActive={gameStarted && game.turn() === 'w'}
                    color="white"
                    onTimeout={async () => await handleTimeout('black')}
                    onTimeUpdate={(time) => handleTimeUpdate('white', time)}
                    remainingTime={challengeState.timeWhite}
                  />
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="game-actions">
              <div className="row g-2">
                <div className="col">
                  <button 
                    className="btn btn-secondary w-100"
                    onClick={handleDrawOffer}
                    disabled={!isPlayerTurn}
                  >
                    <i className="fas fa-handshake me-2"></i>
                    Tablas
                  </button>
                </div>
                <div className="col">
                  <button 
                    className="btn btn-danger w-100"
                    onClick={handleResign}
                  >
                    <i className="fas fa-flag me-2"></i>
                    Abandonar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="col-12 col-lg-4">
            <div className="card bg-dark text-light">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="time-control">
                    <i className="fas fa-clock me-2"></i>
                    <span>{`${challengeState.challenge?.config.timeControl.time}+${challengeState.challenge?.config.timeControl.increment}`}</span>
                  </div>
                  <div className="game-type">
                    {challengeState.challenge?.config.rated ? 
                      <i className="fas fa-trophy" title="Partida clasificatoria"></i> :
                      <i className="fas fa-handshake" title="Partida amistosa"></i>
                    }
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="moves-history">
                  {/* Lista de movimientos aquí */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge; 