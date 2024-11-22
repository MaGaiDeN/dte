import { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { toast } from 'react-hot-toast';

export const useChessGame = (challengeId: string) => {
  const [game, setGame] = useState(new Chess());
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);

  const handleMove = (sourceSquare: Square, targetSquare: Square, piece: string): boolean => {
    if (!isPlayerTurn || !challengeId || !auth.currentUser) return false;

    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1] === 'P' ? 'q' : undefined
      });
      
      if (!result) return false;

      updateDoc(doc(db, 'challenges', challengeId), {
        fen: newGame.fen(),
        lastMove: { from: sourceSquare, to: targetSquare, piece, color: playerColor },
        currentTurn: playerColor === 'white' ? 'black' : 'white',
        moves: arrayUnion({
          from: sourceSquare,
          to: targetSquare,
          piece: piece,
          san: result.san,
          timestamp: Date.now()
        })
      }).catch(error => {
        console.error('Error al realizar movimiento:', error);
        toast.error('Error al realizar el movimiento');
      });

      setGame(newGame);
      setIsPlayerTurn(false);
      return true;

    } catch (error) {
      console.error('Error al realizar movimiento:', error);
      toast.error('Error al realizar el movimiento');
      return false;
    }
  };

  return {
    game,
    setGame,
    isPlayerTurn,
    setIsPlayerTurn,
    playerColor,
    setPlayerColor,
    handleMove
  };
}; 