import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { doc, updateDoc, onSnapshot, arrayUnion, getDoc, query, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import './Challenge.css';
import { toast } from 'react-hot-toast';
import GameClock from '../../components/ChessClock/ChessClock';
import Header from '../../components/Header/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import { playGameStartSound } from '../../utils/sounds';
import MatchScoreTable from '../../components/MatchScoreTable/MatchScoreTable';

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
  whiteScore?: number;
  blackScore?: number;
  results?: Array<'1-0' | '0-1' | '½-½' | null>;
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
      async (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        
        // Verificar si ambos jugadores están presentes y el juego no ha comenzado
        const bothPlayersJoined = data.players.white && data.players.black;
        const gameJustStarted = bothPlayersJoined && !data.gameStarted;
        
        if (gameJustStarted) {
          playGameStartSound();
          await updateDoc(doc(db, 'challenges', challengeId), {
            gameStarted: true,
            startedAt: serverTimestamp()
          });
        }

        // Actualizar nombres de usuarios
        if (data.players.white && data.players.white !== challengeState.players.white) {
          const whiteDoc = await getDoc(doc(db, 'users', data.players.white));
          if (whiteDoc.exists()) {
            setChallengeState(prev => ({
              ...prev,
              players: {
                ...prev.players,
                white: data.players.white,
                whiteUsername: whiteDoc.data().username
              }
            }));
          }
        }

        if (data.players.black && data.players.black !== challengeState.players.black) {
          const blackDoc = await getDoc(doc(db, 'users', data.players.black));
          if (blackDoc.exists()) {
            setChallengeState(prev => ({
              ...prev,
              players: {
                ...prev.players,
                black: data.players.black,
                blackUsername: blackDoc.data().username
              }
            }));
          }
        }

        setGameStarted(data.gameStarted || false);
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

  useEffect(() => {
    if (!challengeId) return;

    const unsubscribe = onSnapshot(doc(db, 'challenges', challengeId), (doc) => {
      const data = doc.data();
      if (!data) return;

      // Actualizar el estado del juego
      const newGame = new Chess(data.fen || game.fen());
      setGame(newGame);
      
      // Actualizar el turno del jugador
      const isCurrentPlayerTurn = 
        (playerColor === 'white' && newGame.turn() === 'w') ||
        (playerColor === 'black' && newGame.turn() === 'b');
      
      setIsPlayerTurn(isCurrentPlayerTurn);
      
      console.log('Estado actualizado:', {
        fen: data.fen,
        playerColor,
        isCurrentPlayerTurn,
        turn: newGame.turn()
      });
    });

    return () => unsubscribe();
  }, [challengeId, playerColor]);

  useEffect(() => {
    if (!challengeState.challenge) return;
    
    const hasAllPlayers = 
      challengeState.challenge.players.white && 
      challengeState.challenge.players.black;
      
    setGameStarted(!!hasAllPlayers);
    
    console.log('Estado del juego:', {
      hasAllPlayers,
      players: challengeState.challenge.players,
      gameStarted
    });
  }, [challengeState.challenge]);

  if (isLoading) {
    return <div className="loading">Cargando reto...</div>;
  }

  // Manejar movimientos
  const makeMove = (sourceSquare: Square, targetSquare: Square) => {
    if (!isPlayerTurn || !challengeId || !auth.currentUser) {
      return false;
    }

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    });

    if (move === null) return false;

    // Crear una nueva instancia del juego para verificar el jaque mate
    const gameCopy = new Chess(game.fen());
    const isCheckmate = gameCopy.isGameOver() && gameCopy.isCheckmate();
    
    // Actualizar Firebase con el estado del juego
    updateDoc(doc(db, 'challenges', challengeId), {
      fen: game.fen(),
      lastMove: { from: sourceSquare, to: targetSquare },
      currentTurn: playerColor === 'white' ? 'black' : 'white',
      ...(isCheckmate && {
        status: 'completed',
        winner: playerColor,
        result: playerColor === 'white' ? '1-0' : '0-1',
        endReason: 'checkmate',
        completedAt: serverTimestamp()
      })
    }).catch(console.error);

    // Mostrar mensaje de jaque mate
    if (isCheckmate) {
      toast.success('¡Jaque Mate! Has ganado la partida 🏆');
    }

    return true;
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
                  onPieceDrop={makeMove}
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
                  <div className="game-info">
                    <i className="fas fa-chess me-2"></i>
                    <span>Partida {challengeState.currentGame} de {challengeState.challenge?.config.numberOfGames}</span>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <MatchScoreTable
                  whitePlayer={challengeState.players.whiteUsername}
                  blackPlayer={challengeState.players.blackUsername}
                  numberOfGames={challengeState.challenge?.config.numberOfGames || 1}
                  results={challengeState.challenge?.results || []}
                  currentGame={challengeState.currentGame}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge; 