import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useState, useEffect } from 'react';

interface BoardProps {
  isPuzzle?: boolean;
}

const MATE_IN_TWO_PUZZLES = [
  {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    solution: ["h5f7"],
    name: "Opera Game Mate"
  },
  {
    fen: "r1b1k1nr/pppp1ppp/2n5/2b1P3/4P3/2Q5/PPP2PPP/RNB1KB1R w KQkq - 0 1",
    solution: ["c3g7"],
    name: "Classic Bishop Sacrifice"
  },
  {
    fen: "r1b2rk1/ppp2ppp/2n5/3q4/8/8/PPPP1PPP/RNBQKB1R w KQ - 0 1",
    solution: ["d1d5"],
    name: "Queen Trap Mate"
  }
];

const Board = ({ isPuzzle = false }: BoardProps) => {
  const [game, setGame] = useState(new Chess());
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [message, setMessage] = useState('');
  const [moveCount, setMoveCount] = useState(0);

  useEffect(() => {
    if (isPuzzle) {
      loadPuzzle(currentPuzzle);
    }
  }, [isPuzzle, currentPuzzle]);

  const loadPuzzle = (index: number) => {
    const puzzle = MATE_IN_TWO_PUZZLES[index];
    const newGame = new Chess(puzzle.fen);
    setGame(newGame);
    setMessage('Encuentra el mate en 2');
    setMoveCount(0);
  };

  const nextPuzzle = () => {
    const nextIndex = (currentPuzzle + 1) % MATE_IN_TWO_PUZZLES.length;
    setCurrentPuzzle(nextIndex);
  };

  function makeAMove(move: any) {
    const gameCopy = new Chess(game.fen());
    
    try {
      const result = gameCopy.move(move);
      setGame(gameCopy);
      
      if (isPuzzle) {
        const puzzle = MATE_IN_TWO_PUZZLES[currentPuzzle];
        setMoveCount(prev => prev + 1);
        
        if (moveCount === 0 && puzzle.solution.includes(result.from + result.to)) {
          setMessage('¡Correcto! Ahora encuentra el mate');
        } else if (moveCount >= 2) {
          if (gameCopy.isCheckmate()) {
            setMessage('¡Excelente!');
            setTimeout(nextPuzzle, 2000);
          } else {
            setMessage('Inténtalo de nuevo');
            setTimeout(() => loadPuzzle(currentPuzzle), 1500);
          }
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  return (
    <div className="board-container">
      {isPuzzle && (
        <div className="puzzle-message">{message}</div>
      )}
      <Chessboard 
        position={game.fen()} 
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