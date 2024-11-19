import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess, Move, Square } from 'chess.js';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import './Challenge.css';
import { signOut } from 'firebase/auth';

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
  challenge?: Challenge;
  isWhiteTurn: boolean;
}

interface MatchScore {
  white: number;
  black: number;
}

interface GameResult {
  winner: 'white' | 'black' | null;
  reason: string;
  score: MatchScore;
}

const Challenge = () => {
  console.log('1. Montando componente Challenge');
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const [game, setGame] = useState(new Chess());
  const [challengeState, setChallengeState] = useState<ChallengeState>({
    isCreator: false,
    gameStarted: false,
    timeWhite: 0,
    timeBlack: 0,
    currentGame: 1,
    totalGames: 1,
    isWhiteTurn: true
  });
  
  const [copySuccess, setCopySuccess] = useState(false);
  const challengeUrl = `${window.location.origin}/challenge/${challengeId}`;
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [clockInterval, setClockInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [timeWhite, setTimeWhite] = useState<number>(0);
  const [timeBlack, setTimeBlack] = useState<number>(0);
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [_drawOffered, setDrawOffered] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    type: 'draw' | 'resign' | 'cancel' | null;
    message: string;
  }>({ type: null, message: '' });
  const [matchScore, setMatchScore] = useState<MatchScore>({ white: 0, black: 0 });
  const [showNextGameDialog, setShowNextGameDialog] = useState(false);

  console.log('2. Challenge ID:', challengeId);
  console.log('3. Auth state:', !!auth.currentUser);

  useEffect(() => {
    const initChallenge = async () => {
      console.log('1. Iniciando Challenge');
      
      if (!challengeId) {
        console.log('2A. No hay ID de reto');
        return;
      }

      const challengeRef = doc(db, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeRef);
      
      if (!challengeDoc.exists()) {
        console.log('2B. Reto no encontrado');
        return;
      }

      const challengeData = challengeDoc.data() as Challenge;
      console.log('3. Datos del reto recibidos:', {
        timeControl: challengeData.config.timeControl,
        tiempo: challengeData.config.timeControl.time,
        incremento: challengeData.config.timeControl.increment,
        configCompleta: challengeData.config
      });

      const initialTime = challengeData.config.timeControl.time * 60;
      console.log('4. Tiempo inicial calculado:', {
        minutos: challengeData.config.timeControl.time,
        segundos: initialTime,
        incremento: challengeData.config.timeControl.increment
      });

      setChallengeState(prev => {
        console.log('5. Actualizando estado del challenge:', {
          tiempo: initialTime,
          incremento: challengeData.config.timeControl.increment
        });
        return {
          ...prev,
          challenge: challengeData,
          timeWhite: initialTime,
          timeBlack: initialTime
        };
      });
    };

    initChallenge();
  }, [challengeId]);

  // Inicializar relojes cuando comienza el juego
  useEffect(() => {
    if (challengeState.gameStarted && challengeState.challenge) {
      const initialTime = challengeState.challenge.config.timeControl.time * 60;
      setTimeWhite(initialTime);
      setTimeBlack(initialTime);
    }
  }, [challengeState.gameStarted]);

  // Manejar el reloj
  useEffect(() => {
    if (!challengeState.gameStarted || !isClockRunning) {
      if (clockInterval) {
        clearInterval(clockInterval);
        setClockInterval(null);
      }
      return;
    }

    const interval = setInterval(() => {
      if (game.turn() === 'w') {
        setTimeWhite(prev => Math.max(0, prev - 1));
      } else {
        setTimeBlack(prev => Math.max(0, prev - 1));
      }
    }, 1000);

    setClockInterval(interval);

    return () => {
      clearInterval(interval);
    };
  }, [challengeState.gameStarted, isClockRunning, game.turn()]);

  // Verificar tiempo agotado
  useEffect(() => {
    const checkTimeOut = async () => {
      if (timeWhite === 0 || timeBlack === 0) {
        setIsClockRunning(false);
        if (clockInterval) {
          clearInterval(clockInterval);
        }

        // Determinar ganador por tiempo
        const winner = timeWhite === 0 ? 'black' : 'white';
        await handleGameOver({
          winner,
          reason: 'timeout',
          score: { white: winner === 'white' ? 1 : 0, black: winner === 'black' ? 1 : 0 }
        });
      }
    };

    checkTimeOut();
  }, [timeWhite, timeBlack]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(challengeUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleJoinChallenge = async () => {
    if (!challengeId || !auth.currentUser || !challengeState.challenge) return;

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const { challenge } = challengeState;

      // Verificar si el reto ya está lleno o cancelado
      if (challenge.status !== 'waiting') {
        console.error('Este reto ya no está disponible');
        return;
      }

      // Determinar el color del jugador que se une
      let playerColor: 'white' | 'black';
      if (challenge.config.color === 'random') {
        playerColor = Math.random() < 0.5 ? 'white' : 'black';
      } else {
        // Si el creador eligió un color específico, el que se une toma el opuesto
        playerColor = challenge.config.color === 'white' ? 'black' : 'white';
      }

      const otherColor = playerColor === 'white' ? 'black' : 'white';

      // Actualizar el documento con el nuevo jugador
      await updateDoc(challengeRef, {
        [`players.${playerColor}`]: auth.currentUser.uid,
        [`players.${otherColor}`]: challenge.creatorId,
        status: 'active',
        startedAt: Date.now()
      });

      setChallengeState(prev => ({
        ...prev,
        gameStarted: true
      }));

    } catch (error) {
      console.error('Error al unirse al reto:', error);
      // TODO: Mostrar mensaje de error al usuario
    }
  };

  // Manejar movimientos
  const handleMove = (
    sourceSquare: Square, 
    targetSquare: Square, 
    piece: string
  ): boolean => {
    if (!isPlayerTurn || !playerColor || !challengeState.gameStarted) return false;

    try {
      const gameCopy = new Chess(game.fen());
      const moveResult = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1] === 'P' ? 'q' : undefined
      });

      if (moveResult) {
        // Actualizar estado local inmediatamente
        setGame(gameCopy);
        setLastMove(moveResult);
        setIsPlayerTurn(false);

        // Realizar actualizaciones asíncronas en segundo plano
        (async () => {
          const increment = challengeState.challenge?.config.timeControl.increment || 0;
          if (playerColor === 'white') {
            setTimeWhite(prev => prev + increment);
          } else {
            setTimeBlack(prev => prev + increment);
          }

          if (!isClockRunning) {
            setIsClockRunning(true);
          }

          const challengeRef = doc(db, 'challenges', challengeId!);
          await updateDoc(challengeRef, {
            currentPosition: gameCopy.fen(),
            lastMove: {
              from: moveResult.from,
              to: moveResult.to,
              promotion: moveResult.promotion,
              san: moveResult.san,
              timestamp: Date.now()
            },
            currentTurn: playerColor === 'white' ? 'black' : 'white',
            timeWhite: playerColor === 'white' ? 
              timeWhite + (challengeState.challenge?.config.timeControl.increment || 0) : 
              timeWhite,
            timeBlack: playerColor === 'black' ? 
              timeBlack + (challengeState.challenge?.config.timeControl.increment || 0) : 
              timeBlack
          });
        })();

        return true;
      }
    } catch (error) {
      console.error('Error al realizar movimiento:', error);
    }
    return false;
  };

  const handleGameOver = async (result: GameResult) => {
    if (!challengeId || !challengeState.challenge) return;

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const newScore = {
        white: matchScore.white + result.score.white,
        black: matchScore.black + result.score.black
      };

      // Actualizar el resultado de la partida actual
      await updateDoc(challengeRef, {
        [`games.${challengeState.currentGame}`]: {
          result,
          pgn: game.pgn(),
          endedAt: Date.now()
        },
        matchScore: newScore
      });

      setMatchScore(newScore);

      // Verificar si el match ha terminado
      if (challengeState.currentGame >= challengeState.totalGames ||
          newScore.white > challengeState.totalGames / 2 ||
          newScore.black > challengeState.totalGames / 2) {
        await handleMatchComplete(newScore);
      } else {
        setShowNextGameDialog(true);
      }

    } catch (error) {
      console.error('Error al finalizar la partida:', error);
    }
  };

  // Función para manejar el fin del match
  const handleMatchComplete = async (finalScore: MatchScore) => {
    if (!challengeId) return;

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        status: 'completed',
        completedAt: Date.now(),
        finalScore,
        winner: finalScore.white > finalScore.black ? 'white' : 'black'
      });

      // Mostrar resultado final
      setShowNextGameDialog(true);
    } catch (error) {
      console.error('Error al finalizar el match:', error);
    }
  };

  // Función para iniciar la siguiente partida
  const startNextGame = async () => {
    if (!challengeId) return;

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const newGame = new Chess();
      
      // Alternar colores si es necesario
      const shouldSwitchColors = challengeState.currentGame % 2 === 0;
      const newPlayers = shouldSwitchColors ? {
        white: challengeState.challenge?.players.black,
        black: challengeState.challenge?.players.white
      } : challengeState.challenge?.players;

      await updateDoc(challengeRef, {
        currentGame: challengeState.currentGame + 1,
        currentPosition: newGame.fen(),
        players: newPlayers,
        currentTurn: 'white',
        timeWhite: (challengeState.challenge?.config.timeControl.time ?? 10) * 60,
        timeBlack: (challengeState.challenge?.config.timeControl.time ?? 10) * 60
      });

      // Actualizar estado local
      setGame(newGame);
      setShowNextGameDialog(false);
      if (shouldSwitchColors) {
        setPlayerColor(playerColor === 'white' ? 'black' : 'white');
        setIsPlayerTurn(playerColor === 'black');
      } else {
        setIsPlayerTurn(playerColor === 'white');
      }
    } catch (error) {
      console.error('Error al iniciar siguiente partida:', error);
    }
  };

  // Suscribirse a cambios en el juego
  useEffect(() => {
    if (!challengeId || !challengeState.gameStarted) return;

    const unsubscribe = onSnapshot(
      doc(db, 'challenges', challengeId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          
          // Actualizar posición si hay cambios
          if (data.currentPosition && data.currentPosition !== game.fen()) {
            setGame(new Chess(data.currentPosition));
          }

          // Actualizar turno
          if (playerColor) {
            setIsPlayerTurn(data.currentTurn === playerColor);
          }

          // Manejar fin del juego
          if (data.status === 'completed') {
            // TODO: Mostrar resultado final
          }
        }
      }
    );

    return () => unsubscribe();
  }, [challengeId, challengeState.gameStarted, playerColor]);

  // Función para ofrecer tablas
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
      setDrawOffered(true);
    } catch (error) {
      console.error('Error al ofrecer tablas:', error);
    }
  };

  // Función para responder a oferta de tablas
  const handleDrawResponse = async (accept: boolean) => {
    if (!challengeId) return;

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      
      if (accept) {
        await handleGameOver({
          winner: null,
          reason: 'draw_agreed',
          score: { white: 0.5, black: 0.5 }
        });
      } else {
        // Rechazar oferta
        await updateDoc(challengeRef, {
          drawOffer: null
        });
      }
      setDrawOffered(false);
    } catch (error) {
      console.error('Error al responder a tablas:', error);
    }
  };

  // Función para rendirse
  const handleResign = async () => {
    if (!challengeId || !playerColor) return;

    try {
      const winner = playerColor === 'white' ? 'black' : 'white';
      await handleGameOver({
        winner,
        reason: 'resignation',
        score: { 
          white: winner === 'white' ? 1 : 0, 
          black: winner === 'black' ? 1 : 0 
        }
      });
    } catch (error) {
      console.error('Error al rendirse:', error);
    }
  };

  // Función para cancelar partida (solo primeros 3 movimientos)
  const handleCancel = async () => {
    if (!challengeId) return;

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        status: 'cancelled',
        cancelledBy: auth.currentUser?.uid,
        cancelledAt: Date.now()
      });
      navigate('/lobby');
    } catch (error) {
      console.error('Error al cancelar partida:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Diálogo de confirmación
  const ConfirmDialog = () => (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <p>{showConfirmDialog.message}</p>
        <div className="confirm-buttons">
          <button 
            className="btn-confirm"
            onClick={() => {
              switch (showConfirmDialog.type) {
                case 'draw':
                  handleDrawResponse(true);
                  break;
                case 'resign':
                  handleResign();
                  break;
                case 'cancel':
                  handleCancel();
                  break;
              }
              setShowConfirmDialog({ type: null, message: '' });
            }}
          >
            Confirmar
          </button>
          <button 
            className="btn-cancel"
            onClick={() => {
              if (showConfirmDialog.type === 'draw') {
                handleDrawResponse(false);
              }
              setShowConfirmDialog({ type: null, message: '' });
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  // Componente para el diálogo de siguiente partida
  const NextGameDialog = () => (
    <div className="next-game-dialog-overlay">
      <div className="next-game-dialog">
        <h3>Partida Finalizada</h3>
        <div className="match-score">
          <p>Resultado del Match:</p>
          <div className="score">
            <span>{matchScore.white}</span>
            <span>-</span>
            <span>{matchScore.black}</span>
          </div>
        </div>
        <button 
          className="btn-next-game"
          onClick={startNextGame}
        >
          Comenzar Siguiente Partida
        </button>
      </div>
    </div>
  );

  // Puedes crear un componente que muestre el último movimiento
  const renderLastMove = () => {
    if (!lastMove) return null;
    return (
      <div className="last-move">
        Último movimiento: {lastMove.from} → {lastMove.to}
      </div>
    );
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Render temporal para debug
  return (
    <div className="challenge-container">
      <div className="navigation-controls">
        <button className="nav-button" onClick={() => navigate('/lobby')}>
          <i className="fas fa-arrow-left"></i> Volver al Lobby
        </button>
        <button className="nav-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
        </button>
      </div>

      {renderLastMove()}
      {challengeState.challenge?.status === 'waiting' && !challengeState.isCreator && (
        <button onClick={handleJoinChallenge}>Unirse al Reto</button>
      )}
      <div className="match-info">
        <div className="time-format">
          <i className="fas fa-clock"></i> {challengeState.challenge?.config.timeControl.time}+{challengeState.challenge?.config.timeControl.increment}
        </div>
        <div className="games-counter">
          Partida {challengeState.currentGame} de {challengeState.challenge?.config.numberOfGames || challengeState.totalGames}
        </div>
      </div>

      <div className="game-header">
        <div className={`player-info ${game.turn() !== 'w' ? 'active' : ''}`}>
          <span className="player-name">Oponente</span>
          <div className="clock-container">
            <div className="clock black">{formatTime(challengeState.timeBlack)}</div>
          </div>
        </div>
      </div>
      
      <Chessboard 
        position={game.fen()}
        onPieceDrop={handleMove}
        boardOrientation={playerColor || 'white'}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,.2)'
        }}
      />

      <div className="game-header">
        <div className={`player-info ${game.turn() === 'w' ? 'active' : ''}`}>
          <span className="player-name">{auth.currentUser?.displayName}</span>
          <div className="clock-container">
            <div className="clock white">{formatTime(challengeState.timeWhite)}</div>
          </div>
        </div>
      </div>

      <div className="game-controls">
        <button className="control-button" onClick={handleDrawOffer}>
          <i className="fas fa-handshake"></i>
        </button>
        <button className="control-button" onClick={() => setShowConfirmDialog({ type: 'resign', message: '¿Seguro que quieres abandonar?' })}>
          <i className="fas fa-flag"></i>
        </button>
        <button className="control-button" onClick={handleCopyLink}>
          <i className="fas fa-link"></i>
        </button>
      </div>
      
      {showConfirmDialog.type && <ConfirmDialog />}
      {showNextGameDialog && <NextGameDialog />}
      {copySuccess && <div className="copy-success">¡Enlace copiado!</div>}
    </div>
  );
};

export default Challenge; 