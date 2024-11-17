import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useState } from 'react';

interface BoardProps {
  isPuzzle?: boolean;
}

const Board = ({ isPuzzle = false }: BoardProps) => {
  const [game, setGame] = useState(new Chess());

  function makeAMove(move: any) {
    const gameCopy = new Chess(game.fen());
    try {
      gameCopy.move(move);
      setGame(gameCopy);
      return true;
    } catch (error) {
      return false;
    }
  }

  return (
    <div className={`board-container ${isPuzzle ? 'puzzle-mode' : ''}`}>
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