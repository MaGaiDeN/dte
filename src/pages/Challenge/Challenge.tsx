import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { doc, updateDoc, onSnapshot, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import './Challenge.css';
import { toast } from 'react-hot-toast';
import GameClock from '../../components/ChessClock/ChessClock';

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

interface Move {
  from: string;
  to: string;
  promotion?: string;
  piece?: string;
  color?: 'white' | 'black';
  san?: string;
}

const Challenge = () => {
  // Estados básicos del juego
  const [game, setGame] = useState(new Chess());
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [timeWhite, setTimeWhite] = useState(0);
  const [timeBlack, setTimeBlack] = useState(0);
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

    const initialTime = challengeState.challenge.config.timeControl.time * 60;
    setTimeWhite(initialTime);
    setTimeBlack(initialTime);
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
  const handleMove = async (move: Move) => {
    if (!isPlayerTurn || !challengeId || !auth.currentUser) return;

    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move(move);
      
      if (!result) return;

      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        fen: newGame.fen(),
        lastMove: {
          from: move.from,
          to: move.to,
          promotion: move.promotion,
          piece: move.piece,
          color: playerColor
        },
        currentTurn: playerColor === 'white' ? 'black' : 'white',
        moves: arrayUnion({
          from: move.from,
          to: move.to,
          piece: move.piece,
          san: result.san,
          timestamp: Date.now()
        })
      });

      setGame(newGame);
      setIsPlayerTurn(false);

    } catch (error) {
      console.error('Error al realizar movimiento:', error);
      toast.error('Error al realizar el movimiento');
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

  return (
    <div className="challenge-container">
      <header className="main-header">
        <Link to="/" className="logo">
          <i className="fas fa-chess-knight logo-icon"></i>
          <div className="logo-text">
            <span className="logo-chess">CHESS</span>
            <span className="logo-match">MATCH</span>
          </div>
        </Link>
        {auth.currentUser ? (
          <div className="user-menu">
            {/* Aquí puedes agregar el menú de usuario si lo necesitas */}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/register" className="btn-signup">Sign Up</Link>
            <Link to="/login" className="btn-login">Log In</Link>
          </div>
        )}
      </header>

      <div className="game-content">
        <div className="game-info">
          <div className="match-details">
            <div className="time-details">
              <div>Blancas: {timeWhite}s</div>
              <div>Negras: {timeBlack}s</div>
            </div>
            <div className="game-type">
              <i className="fas fa-trophy"></i>
              <span>{challengeState.challenge?.config.rated ? 'Clasificatoria' : 'Amistosa'}</span>
            </div>
            <div className="games-count">
              <i className="fas fa-chess-board"></i>
              <span>
                {challengeState.challenge?.config.numberOfGames === 1 
                  ? '1 partida' 
                  : `Al mejor de ${challengeState.challenge?.config.numberOfGames}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="game-board-container">
          <div className="player-info black">
            <GameClock
              timeInMinutes={challengeState.challenge?.config.timeControl.time || 0}
              increment={challengeState.challenge?.config.timeControl.increment || 0}
              isActive={game.turn() === 'b'}
              color="black"
              onTimeout={() => {
                toast.error('Tiempo agotado - Victoria de las blancas');
              }}
            />
            <span className="player-name">
              {challengeState.players.blackUsername || 'Esperando jugador...'}
            </span>
          </div>

          <div className="game-board">
            <Chessboard 
              position={game.fen()}
              onPieceDrop={(sourceSquare, targetSquare) => {
                const move = {
                  from: sourceSquare,
                  to: targetSquare,
                  promotion: 'q'
                };
                handleMove(move);
                return true;
              }}
              boardOrientation={playerColor === 'black' ? 'black' : 'white'}
            />
          </div>

          <div className="player-info white">
            <GameClock
              timeInMinutes={challengeState.challenge?.config.timeControl.time || 0}
              increment={challengeState.challenge?.config.timeControl.increment || 0}
              isActive={game.turn() === 'w'}
              color="white"
              onTimeout={() => {
                toast.error('Tiempo agotado - Victoria de las negras');
              }}
            />
            <span className="player-name">
              {challengeState.players.whiteUsername || 'Esperando jugador...'}
            </span>
          </div>
        </div>

        <div className="game-controls">
          <button className="btn-control resign" onClick={handleResign}>
            <i className="fas fa-flag"></i>
            Abandonar
          </button>
          <button 
            className="btn-control"
            onClick={() => handleDrawOffer()}
            disabled={!isPlayerTurn}
          >
            <i className="fas fa-handshake"></i>
            Ofrecer tablas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Challenge; 