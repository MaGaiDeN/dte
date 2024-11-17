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
            if (process.env.NODE_ENV === 'development') {
              console.log('Datos del puzzle recibidos:', {
                pgn: puzzleData.game.pgn,
                initialPly: puzzleData.puzzle.initialPly,
                solution: puzzleData.puzzle.solution,
                color: puzzleData.puzzle.initialPly % 2 === 0 ? 'blancas' : 'negras'
              });
            }

            // Cargar el PGN completo
            newGame.loadPgn(puzzleData.game.pgn);
            const moves = newGame.history();
            const lastMove = moves[puzzleData.puzzle.initialPly - 1];

            if (process.env.NODE_ENV === 'development') {
              console.log('Último movimiento antes del puzzle:', lastMove);
              console.log('Le toca mover a:', puzzleData.puzzle.initialPly % 2 === 0 ? 'blancas' : 'negras');
            }

            // Reiniciar y aplicar movimientos hasta la posición inicial del puzzle
            newGame.reset();
            for (let i = 0; i < puzzleData.puzzle.initialPly; i++) {
              const result = newGame.move(moves[i]);
              if (!result) {
                throw new Error(`Error al aplicar movimiento ${i}: ${moves[i]}`);
              }
            }

            const puzzleFen = newGame.fen();
            
            if (process.env.NODE_ENV === 'development') {
              console.log('Posición inicial del puzzle:', {
                ply: puzzleData.puzzle.initialPly,
                fen: puzzleFen,
                turno: newGame.turn(),
                movimientosPosibles: newGame.moves()
              });
            }
            
            if (isSubscribed) {
              setPuzzle({
                fen: puzzleFen,
                moves: puzzleData.puzzle.solution,
                rating: puzzleData.puzzle.rating,
                themes: puzzleData.puzzle.themes
              });
              
              // Primero establecemos el juego en la posición inicial
              const initialGame = new Chess(puzzleFen);
              setGame(initialGame);
              
              // Automatizamos el movimiento Nxd3
              setTimeout(() => {
                const moveResult = initialGame.move({
                  from: 'b4',
                  to: 'd3'
                });
                
                if (moveResult) {
                  setGame(initialGame);
                  setMessage('Tu turno');
                }
              }, 1000);
            }
          } catch (error) {
            console.error('Error:', error);
            if (isSubscribed) {
              setMessage('Error al cargar el puzzle. Intenta recargar la página.');
            }
          }
        } catch (error) {
          console.error('Error:', error);
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