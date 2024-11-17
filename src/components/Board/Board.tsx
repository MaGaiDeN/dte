import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useState, useEffect } from 'react';
import { puzzles } from '../../data/puzzles';

console.log('Puzzles cargados:', puzzles);

interface Puzzle {
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
}

interface BoardProps {
  isPuzzle?: boolean;
}

const Board: React.FC<BoardProps> = ({ isPuzzle = false }) => {
  const [game, setGame] = useState(new Chess());
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [message, setMessage] = useState('');
  const [moveCount, setMoveCount] = useState(0);

  useEffect(() => {
    if (isPuzzle) {
      // Si estamos en modo puzzle, intentar cargar el puzzle guardado primero
      const savedPuzzle = localStorage.getItem('currentPuzzle');
      if (savedPuzzle) {
        const parsedPuzzle = JSON.parse(savedPuzzle);
        setPuzzle(parsedPuzzle);
        const newGame = new Chess();
        newGame.load(parsedPuzzle.fen);
        setGame(newGame);
      } else {
        // Si no hay puzzle guardado, cargar uno nuevo
        fetchRandomPuzzle();
      }
    }
  }, [isPuzzle]);

  // Guardar el puzzle cuando cambie
  useEffect(() => {
    if (puzzle) {
      localStorage.setItem('currentPuzzle', JSON.stringify(puzzle));
    }
  }, [puzzle]);

  const fetchRandomPuzzle = async () => {
    try {
      const response = await fetch('https://lichess.org/api/puzzle/daily', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar el puzzle');
      }

      const puzzleData = await response.json();
      
      // Validar que tenemos los datos necesarios
      if (!puzzleData?.game?.pgn || !puzzleData?.puzzle?.solution) {
        throw new Error('Datos del puzzle incompletos');
      }

      const newGame = new Chess();
      
      try {
        // Cargar el PGN y avanzar hasta la posición inicial del puzzle
        newGame.loadPgn(puzzleData.game.pgn);
        const moves = newGame.history();
        const initialPly = puzzleData.puzzle.initialPly;
        
        // Reiniciar el juego y aplicar los movimientos hasta la posición del puzzle
        newGame.reset();
        for (let i = 0; i < initialPly; i++) {
          if (moves[i]) newGame.move(moves[i]);
        }
        
        setPuzzle({
          fen: newGame.fen(),
          moves: puzzleData.puzzle.solution,
          rating: puzzleData.puzzle.rating,
          themes: puzzleData.puzzle.themes
        });
        
        setGame(newGame);
        setMessage(`¡Puzzle diario! (Rating: ${puzzleData.puzzle.rating})`);
        setMoveCount(0);
      } catch (error) {
        throw new Error('Error al procesar el PGN del puzzle');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al cargar el puzzle. Intenta recargar la página.');
    }
  };

  function makeAMove(move: any) {
    const gameCopy = new Chess(game.fen());
    
    try {
      const result = gameCopy.move(move);
      setGame(gameCopy);
      
      if (!puzzle) return false;
      
      setMoveCount(prev => prev + 1);
      const moveString = result.from + result.to;
      
      // Comprobar si el movimiento coincide con la solución
      if (moveCount === 0 && moveString === puzzle.moves[0]) {
        setMessage('¡Correcto! Ahora encuentra el mate');
      } else if (moveCount === 0) {
        setMessage('Movimiento incorrecto. Inténtalo de nuevo');
        setTimeout(() => {
          const newGame = new Chess(puzzle.fen);
          setGame(newGame);
          setMoveCount(0);
        }, 1500);
        return true;
      } else if (moveCount >= 2) {
        if (gameCopy.isCheckmate()) {
          setMessage('¡Excelente! Has encontrado el mate en 2');
          setTimeout(fetchRandomPuzzle, 2000);
        } else {
          setMessage('Inténtalo de nuevo');
          setTimeout(() => {
            const newGame = new Chess(puzzle.fen);
            setGame(newGame);
            setMoveCount(0);
          }, 1500);
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Agregar una función auxiliar para obtener el turno
  const getTurn = (fen: string) => {
    const turnField = fen.split(' ')[1]; // El turno es el segundo campo en el FEN
    return turnField === 'w' ? 'Blancas' : 'Negras';
  };

  return (
    <div className="board-container">
      <div className="puzzle-message">{message}</div>
      {puzzle && (
        <div className="puzzle-info" style={{ color: 'white' }}>
          <p><strong>Turno:</strong> {getTurn(puzzle.fen)}</p>
        </div>
      )}
      <Chessboard 
        position={game.fen()} 
        boardOrientation={puzzle?.fen.split(' ')[1] === 'b' ? 'black' : 'white'}
        onPieceDrop={(from, to) => {
          return makeAMove({
            from,
            to,
            promotion: 'q'
          });
        }}
      />
    </div>
  );
};

export default Board;