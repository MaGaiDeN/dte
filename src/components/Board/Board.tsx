import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { useState, useEffect } from 'react';
import ChessClock from '../ChessClock/ChessClock';
import './Board.css';

interface Puzzle {
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
}

interface BoardProps {
  isPuzzle?: boolean;
  timeControl?: {
    time: number;
    increment: number;
  };
}

const Board: React.FC<BoardProps> = ({ isPuzzle = false, timeControl }) => {
  const [game, setGame] = useState<Chess | null>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [message, setMessage] = useState('Cargando puzzle...');
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>('white');

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
            
            console.log('Movimientos totales:', moves.length);
            console.log('Initial Ply:', puzzleData.puzzle.initialPly);
            console.log('Moves:', moves);

            // Reiniciar y aplicar movimientos hasta la posición inicial del puzzle
            newGame.reset();
            for (let i = 0; i < puzzleData.puzzle.initialPly; i++) {
              newGame.move(moves[i]);
            }
            
            const puzzleFen = newGame.fen();
            const nextMove = moves[puzzleData.puzzle.initialPly];

            console.log('Siguiente movimiento:', nextMove);
            
            if (!nextMove) {
              console.error('No se encontró el siguiente movimiento');
              if (isSubscribed) {
                setMessage('Error al cargar el puzzle. Intenta recargar la página.');
              }
              return;
            }
            
            if (isSubscribed) {
              setPuzzle({
                fen: puzzleFen,
                moves: puzzleData.puzzle.solution,
                rating: puzzleData.puzzle.rating,
                themes: puzzleData.puzzle.themes
              });
              
              // Mostrar la posición inicial
              setGame(new Chess(puzzleFen));
              setMessage('Observa el movimiento del oponente...');

              // Realizar el primer movimiento del oponente después de un segundo
              setTimeout(() => {
                if (!isSubscribed) return;
                
                const gameCopy = new Chess(puzzleFen);
                try {
                  console.log('Intentando mover:', nextMove);
                  const moveResult = gameCopy.move(nextMove);
                  if (!moveResult) {
                    throw new Error(`Movimiento inválido: ${nextMove}`);
                  }
                  
                  setGame(gameCopy);
                  setMessage('Tu turno - Encuentra el mejor movimiento');
                } catch (moveError) {
                  console.error('Error al realizar el movimiento:', moveError);
                  setMessage('Error al cargar el puzzle. Intenta recargar la página.');
                }
              }, 1000);
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

  function parsePuzzleMove(moveString: string) {
    // Manejar casos especiales
    if (moveString.includes('O-O-O')) return { from: 'e1', to: 'c1' }; // Enroque largo
    if (moveString.includes('O-O')) return { from: 'e1', to: 'g1' };   // Enroque corto
    
    return {
      from: moveString.slice(0, 2) as Square,
      to: moveString.slice(2, 4) as Square,
      promotion: moveString.length === 5 ? moveString[4] : undefined
    };
  }

  function makeAMove(move: any) {
    if (!game || !puzzle) return false;
    
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      
      if (result) {
        const expectedMove = puzzle.moves[currentMoveIndex];
        const parsedExpectedMove = parsePuzzleMove(expectedMove);
        const resultingFen = gameCopy.fen().split(' ')[0]; // Comparar solo posición
        
        const tempGame = new Chess(game.fen());
        const expectedResult = tempGame.move(parsedExpectedMove);
        const expectedFen = expectedResult ? tempGame.fen().split(' ')[0] : '';
        
        if (resultingFen === expectedFen) {
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
      }
      
      setMessage('Movimiento incorrecto. Intenta de nuevo.');
      return false;
    } catch (error) {
      console.error('Error en makeAMove:', error);
      return false;
    }
  }

  return (
    <div className="board-container">
      {timeControl && (
        <ChessClock
          timeInMinutes={timeControl.time}
          increment={timeControl.increment}
          isActive={currentTurn === 'black'}
          color="black"
          onTimeout={() => {/* manejar timeout */}}
        />
      )}

      {game && (
        <Chessboard 
          position={game.fen()} 
          boardOrientation="white"
          onPieceDrop={(from, to) => {
            const result = makeAMove({
              from,
              to,
              promotion: 'q'
            });
            
            if (result) {
              setCurrentTurn(game.turn() === 'w' ? 'white' : 'black');
            }
            
            return result;
          }}
        />
      )}

      {timeControl && (
        <ChessClock
          timeInMinutes={timeControl.time}
          increment={timeControl.increment}
          isActive={currentTurn === 'white'}
          color="white"
          onTimeout={() => {/* manejar timeout */}}
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