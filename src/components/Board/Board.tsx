import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { useState, useEffect } from 'react';

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
  const [game, setGame] = useState<Chess | null>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [message, setMessage] = useState('Cargando puzzle...');
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  useEffect(() => {
    let isSubscribed = true;
    let hasLoaded = false;

    if (isPuzzle) {
      const loadPuzzle = async () => {
        try {
          if (game || puzzle || hasLoaded) return;
          hasLoaded = true;

          const response = await fetch('https://lichess.org/api/puzzle/daily');
          if (!response.ok) throw new Error('Error al cargar el puzzle');
          
          const puzzleData = await response.json();
          const newGame = new Chess();
          
          try {
            // Cargar el PGN y llegar a la posición inicial del puzzle
            newGame.loadPgn(puzzleData.game.pgn);
            const moves = newGame.history();
            
            // Reiniciar y aplicar movimientos hasta la posición inicial del puzzle
            newGame.reset();
            for (let i = 0; i < puzzleData.puzzle.initialPly; i++) {
              newGame.move(moves[i]);
            }
            
            // Realizar el movimiento Qe6 automáticamente
            newGame.move('Qe6');
            const puzzleFen = newGame.fen();
            
            if (isSubscribed) {
              setPuzzle({
                fen: puzzleFen,
                moves: puzzleData.puzzle.solution,
                rating: puzzleData.puzzle.rating,
                themes: puzzleData.puzzle.themes
              });
              
              setGame(new Chess(puzzleFen));
              setMessage('Tu turno - Mueve las blancas');
              setCurrentMoveIndex(0); // Reseteamos el índice de movimientos
            }
          } catch (error) {
            console.error('Error al procesar el puzzle:', error);
            if (isSubscribed) {
              setMessage('Error al cargar el puzzle. Intenta recargar la página.');
            }
          }
        } catch (error) {
          console.error('Error al obtener el puzzle:', error);
          if (isSubscribed) {
            setMessage('Error al cargar el puzzle. Intenta recargar la página.');
          }
        }
      };

      loadPuzzle();
    }

    return () => {
      isSubscribed = false;
    };
  }, [isPuzzle]);

  function makeAMove(move: any) {
    if (!game || !puzzle) return false;
    
    try {
      const moveString = move.from + move.to + (move.promotion || '');
      const expectedMove = puzzle.moves[currentMoveIndex];
      
      if (moveString === expectedMove) {
        const gameCopy = new Chess(game.fen());
        const result = gameCopy.move(move);
        
        if (result) {
          setGame(gameCopy);
          
          // Verificar si es el último movimiento del puzzle
          if (currentMoveIndex === puzzle.moves.length - 1) {
            setMessage(`¡Felicidades! 🎉 Has resuelto el puzzle correctamente.`);
            return true;
          }
          
          setCurrentMoveIndex(currentMoveIndex + 1);
          
          // Si no es el último movimiento, continuar con la secuencia normal
          setTimeout(() => {
            if (currentMoveIndex + 1 < puzzle.moves.length) {
              const nextMove = puzzle.moves[currentMoveIndex + 1];
              const from = nextMove.slice(0, 2) as Square;
              const to = nextMove.slice(2, 4) as Square;
              
              const nextResult = gameCopy.move({
                from,
                to,
                promotion: nextMove.length === 5 ? nextMove[4] : undefined
              });
              
              if (nextResult) {
                setGame(new Chess(gameCopy.fen()));
                setCurrentMoveIndex(currentMoveIndex + 2);
                setMessage('Tu turno');
              }
            }
          }, 500);
          return true;
        }
      } else {
        setMessage('Movimiento incorrecto. Intenta de nuevo.');
      }
      return false;
    } catch (error) {
      console.error('Error en makeAMove:', error);
      return false;
    }
  }

  return (
    <div className="puzzle-container">
      {game && (
        <Chessboard 
          position={game.fen()} 
          boardOrientation="white"
          onPieceDrop={(from, to) => {
            // Solo incluir promoción si es un movimiento de peón a última fila
            const piece = game.get(from);
            const isPromotion = piece?.type === 'p' && (to[1] === '8' || to[1] === '1');
            
            return makeAMove({
              from,
              to,
              promotion: isPromotion ? 'q' : undefined
            });
          }}
        />
      )}
      {message && (
        <div className="puzzle-message" style={{ 
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: puzzle && currentMoveIndex === puzzle.moves.length - 1 ? '#e6ffe6' : '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Board;