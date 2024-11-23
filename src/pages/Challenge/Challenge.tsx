import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess, Square, Piece } from 'chess.js';
import { doc, updateDoc, onSnapshot, arrayUnion, getDoc, query, serverTimestamp, setDoc, deleteDoc, collection, increment } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import './Challenge.css';
import { toast } from 'react-hot-toast';
import GameClock from '../../components/ChessClock/ChessClock';
import Header from '../../components/Header/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import { playGameStartSound } from '../../utils/sounds';
import MatchScoreTable from '../../components/MatchScoreTable/MatchScoreTable';
import GameOverModal from '../../components/GameOverModal/GameOverModal';

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
  readyForNextGame?: {
    white?: boolean;
    black?: boolean;
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
  results: Array<'1-0' | '0-1' | '½-½' | null>;
  gameFinished: boolean;
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
    },
    results: [],
    gameFinished: false
  });

  const { challengeId } = useParams();
  const navigate = useNavigate();

  // Añade estos estados
  const [gameStarted, setGameStarted] = useState(false);
  const [initialTime, setInitialTime] = useState<number>(0);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameResult, setGameResult] = useState<'1-0' | '0-1' | '½-½' | null>(null);
  const [gameEndReason, setGameEndReason] = useState<'checkmate' | 'timeout' | 'draw' | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [readyForNextGame, setReadyForNextGame] = useState<{[key: string]: boolean}>({});
  const [drawOffered, setDrawOffered] = useState<string | null>(null);

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
      const newGame = new Chess(data.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      setGame(newGame);
      
      // Actualizar oferta de tablas
      if (data.drawOffer) {
        setDrawOffered(data.drawOffer.offeredBy);
      } else {
        setDrawOffered(null);
      }

      // Verificar si el juego ha terminado por abandono
      if (data.status === 'completed' && data.endReason === 'resignation') {
        const result = data.winner === 'white' ? '1-0' : '0-1';
        setGameResult(result);
        setShowGameOverModal(true);
        toast.success(`${data.winner === playerColor ? '¡Has ganado!' : 'Tu oponente ha abandonado'}`);
      }
      
      // Corregir la lógica del turno
      const isCurrentPlayerTurn = playerColor === (newGame.turn() === 'w' ? 'white' : 'black');
      setIsPlayerTurn(isCurrentPlayerTurn);
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

  useEffect(() => {
    if (!challengeId) return;

    const unsubscribe = onSnapshot(doc(db, 'challenges', challengeId), async (docSnapshot) => {
      const data = docSnapshot.data();
      if (!data) return;

      if (data.readyForNextGame?.white && data.readyForNextGame?.black) {
        const newGame = new Chess();
        setGame(newGame);
        
        await updateDoc(docSnapshot.ref, {
          fen: newGame.fen(),
          status: 'active',
          drawOffer: null,
          readyForNextGame: null,
          currentGame: (data.currentGame || 1) + 1,
          gameStarted: true,
          currentTurn: 'white',
          [`timeLeft.white`]: initialTime,
          [`timeLeft.black`]: initialTime
        });

        setGameResult(null);
        setShowGameOverModal(false);
        setDrawOffered(null);
        setGameStarted(true);
        
        // Asegurar que el turno está correctamente establecido
        setIsPlayerTurn(playerColor === 'white');
      }
    });

    return () => unsubscribe();
  }, [challengeId, initialTime, playerColor]);

  useEffect(() => {
    if (!challengeId) return;

    const unsubscribe = onSnapshot(doc(db, 'challenges', challengeId), (doc) => {
      const data = doc.data();
      if (!data) return;

      // Actualizar modal si el juego ha terminado
      if (data.status === 'completed') {
        setGameResult(data.result);
        setGameEndReason(data.endReason);
        setShowGameOverModal(true);
        
        // Actualizar puntuaciones
        setChallengeState(prev => ({
          ...prev,
          challenge: {
            ...prev.challenge!,
            whiteScore: data.score?.white || 0,
            blackScore: data.score?.black || 0,
            results: [...(prev.challenge?.results || []), data.result]
          }
        }));
      }
    });

    return () => unsubscribe();
  }, [challengeId]);

  // Añadir un useEffect para manejar las actualizaciones del estado del juego
  useEffect(() => {
    if (!challengeId) return;

    const unsubscribe = onSnapshot(doc(db, 'challenges', challengeId), (docSnapshot) => {
      const data = docSnapshot.data();
      if (!data) return;

      // Actualizar el estado solo cuando sea necesario
      setChallengeState(prevState => {
        if (JSON.stringify(prevState.challenge?.results) === JSON.stringify(data.results)) {
          return prevState;
        }

        return {
          ...prevState,
          challenge: {
            ...prevState.challenge!,
            id: challengeId,
            ...data,
          } as Challenge,
          currentGame: data.currentGame || 1,
          results: data.results || []
        };
      });
    });

    return () => unsubscribe();
  }, [challengeId]);

  if (isLoading) {
    return <div className="loading">Cargando reto...</div>;
  }

  // Manejar movimientos
  const makeMove = (from: Square, to: Square): boolean => {
    try {
      const move = game.move({ from, to, promotion: 'q' });
      if (move && challengeId) {
        // Verificar mate después del movimiento
        if (game.isCheckmate()) {
          const winner = game.turn() === 'w' ? 'black' : 'white';
          const result = winner === 'white' ? '1-0' : '0-1';
          
          // Actualizar Firestore con el resultado
          updateDoc(doc(db, 'challenges', challengeId), {
            status: 'completed',
            result: result,
            endReason: 'checkmate',
            winner: winner,
            [`score.${winner}`]: increment(1)
          });
          
          // Actualizar estado local
          setGameResult(result);
          setGameEndReason('checkmate');
          setShowGameOverModal(true);
        }
        
        // Actualizar Firebase con el estado del juego
        updateDoc(doc(db, 'challenges', challengeId), {
          fen: game.fen(),
          lastMove: { from, to },
          currentTurn: game.turn() === 'w' ? 'white' : 'black'
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en makeMove:', error);
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
      setDrawOffered(auth.currentUser.uid);
      toast.success('Oferta de tablas enviada');
    } catch (error) {
      toast.error('Error al ofrecer tablas');
    }
  };

  const handleDrawResponse = async (accept: boolean) => {
    if (!challengeId || !auth.currentUser) return;
    
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      if (accept) {
        await updateDoc(challengeRef, {
          status: 'completed',
          result: '½-½',
          endReason: 'draw_agreed',
          drawOffer: null,
          completedAt: serverTimestamp()
        });
        setGameResult('½-½');
        setGameEndReason('draw');
        setShowGameOverModal(true);
        toast.success('Tablas acordadas');
      } else {
        await updateDoc(challengeRef, {
          drawOffer: null
        });
        toast('Oferta de tablas rechazada', {
          icon: 'ℹ️'
        });
      }
      setDrawOffered(null);
    } catch (error) {
      toast.error('Error al responder a la oferta de tablas');
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
    if (!challengeId || !gameStarted) return;
    
    setChallengeState(prev => ({
      ...prev,
      [`time${color.charAt(0).toUpperCase() + color.slice(1)}`]: time
    }));

    try {
      await updateDoc(doc(db, 'challenges', challengeId), {
        [`timeLeft.${color}`]: time
      });
    } catch (error) {
      console.error('Error updating time:', error);
    }
  };

  const handleTimeout = async (loser: 'white' | 'black') => {
    const result = loser === 'white' ? '0-1' : '1-0';
    setGameResult(result);
    setGameEndReason('timeout');
    setShowGameOverModal(true);
  };

  // Función para iniciar siguiente partida
  const startNextGame = async () => {
    if (challengeState.currentGame < challengeState.challenge?.config.numberOfGames!) {
      // Lógica para iniciar siguiente partida
      setShowGameOverModal(false);
      // ... resto de la lógica
    }
  };

  // Modificar handleGameOver para evitar actualizaciones innecesarias
  const handleGameOver = (winner: 'white' | 'black' | 'draw') => {
    if (!challengeId || challengeState.gameFinished) return;

    const result = winner === 'white' ? '1-0' : winner === 'black' ? '0-1' : '½-½';
    const newResults = [...(challengeState.challenge?.results || [])];
    newResults[challengeState.currentGame - 1] = result;

    updateDoc(doc(db, 'challenges', challengeId), {
      results: newResults,
      gameFinished: true,
      currentGame: challengeState.currentGame,
      gameState: newResults.length < challengeState.challenge?.config.numberOfGames! ? 'waiting' : 'finished'
    });
  };

  const handleNextGame = async () => {
    if (!challengeId || !playerColor) return;
    
    try {
      await updateDoc(doc(db, 'challenges', challengeId), {
        [`readyForNextGame.${playerColor}`]: true
      });
    } catch (error) {
      console.error('Error al preparar nueva partida:', error);
      toast.error('Error al preparar nueva partida');
    }
  };

  const handleSquareClick = (square: Square) => {
    if (!isPlayerTurn) return;

    if (selectedSquare === null) {
      // Primera casilla seleccionada
      const piece = game.get(square);
      if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
        setSelectedSquare(square);
      }
    } else {
      // Segunda casilla seleccionada
      if (square === selectedSquare) {
        setSelectedSquare(null);
      } else {
        const moveResult = makeMove(selectedSquare, square);
        setSelectedSquare(null);
        return moveResult;
      }
    }
  };

  // Crear un adaptador para onPieceDrop
  const handlePieceDrop = (sourceSquare: Square, targetSquare: Square, _piece: string): boolean => {
    return makeMove(sourceSquare, targetSquare);
  };

  return (
    <div className="challenge-container">
      <Header />
      <div className="challenge-content container-fluid pt-5">
        <div className="row">
          <div className="col-12 col-lg-8">
            {playerColor === 'black' ? (
              <>
                {/* Jugador Blanco arriba cuando somos negras */}
                <div className="player-box white mb-3">
                  <div className="row align-items-center w-100">
                    <div className="col text-center">
                      <div className="player-info">
                        <span className="player-name text-black">
                          {challengeState.players.whiteUsername || 'Esperando...'}
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
                        isActive={gameStarted && game.turn() === 'w'}
                        color="white"
                        onTimeout={async () => await handleTimeout('black')}
                        onTimeUpdate={(time) => handleTimeUpdate('white', time)}
                        remainingTime={challengeState.timeWhite}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Jugador Negro arriba cuando somos blancas */}
                <div className="player-box black mb-3">
                  <div className="row align-items-center w-100">
                    <div className="col text-center">
                      <div className="player-info">
                        <span className="player-name text-black">
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
              </>
            )}

            {/* Tablero */}
            <div className="board-wrapper mb-3">
              <div className="board-container">
                <Chessboard 
                  position={game.fen()}
                  onPieceDrop={handlePieceDrop}
                  onSquareClick={handleSquareClick}
                  boardOrientation={playerColor === 'black' ? 'black' : 'white'}
                  customBoardStyle={{
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)'
                  }}
                  customSquareStyles={{
                    ...(selectedSquare && {
                      [selectedSquare]: {
                        backgroundColor: 'rgba(255, 140, 66, 0.4)'
                      }
                    })
                  }}
                />
              </div>
            </div>

            {playerColor === 'black' ? (
              <>
                {/* Jugador Negro abajo cuando somos negras */}
                <div className="player-box black mb-3">
                  <div className="row align-items-center w-100">
                    <div className="col text-center">
                      <div className="player-info">
                        <span className="player-name text-black">
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
              </>
            ) : (
              <>
                {/* Jugador Blanco abajo cuando somos blancas */}
                <div className="player-box white mb-3">
                  <div className="row align-items-center w-100">
                    <div className="col text-center">
                      <div className="player-info">
                        <span className="player-name text-black">
                          {challengeState.players.whiteUsername || 'Esperando...'}
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
                        isActive={gameStarted && game.turn() === 'w'}
                        color="white"
                        onTimeout={async () => await handleTimeout('black')}
                        onTimeUpdate={(time) => handleTimeUpdate('white', time)}
                        remainingTime={challengeState.timeWhite}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
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
                
                {/* Añadir botones de control */}
                <div className="game-controls mt-4">
                  {drawOffered && drawOffered !== auth.currentUser?.uid ? (
                    <div className="draw-offer-buttons">
                      <button 
                        className="btn btn-success me-2" 
                        onClick={() => handleDrawResponse(true)}
                      >
                        Aceptar tablas
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDrawResponse(false)}
                      >
                        Rechazar tablas
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-warning me-2" 
                      onClick={() => handleDrawOffer()}
                      disabled={!gameStarted || !!drawOffered}
                    >
                      {drawOffered === auth.currentUser?.uid ? 'Tablas ofrecidas' : 'Ofrecer Tablas'}
                    </button>
                  )}
                  
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleResign()}
                    disabled={!gameStarted}
                  >
                    Abandonar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GameOverModal
        isOpen={showGameOverModal}
        gameResult={gameResult as '1-0' | '0-1' | '½-½'}
        reason={gameEndReason ?? 'checkmate'}
        whiteScore={challengeState.challenge?.whiteScore || 0}
        blackScore={challengeState.challenge?.blackScore || 0}
        currentGame={challengeState.currentGame}
        totalGames={challengeState.challenge?.config.numberOfGames || 1}
        onNextGame={handleNextGame}
        readyForNextGame={challengeState.challenge?.readyForNextGame || {}}
        playerColor={playerColor}
      />
    </div>
  );
};

export default Challenge; 