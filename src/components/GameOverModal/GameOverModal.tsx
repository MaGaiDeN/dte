import React from 'react';
import './GameOverModal.css';

interface GameOverModalProps {
  isOpen: boolean;
  gameResult: '1-0' | '0-1' | '½-½';
  reason: 'checkmate' | 'timeout' | 'draw' | 'resignation';
  whiteScore: number;
  blackScore: number;
  currentGame: number;
  totalGames: number;
  onNextGame: () => void;
  readyForNextGame: {[key: string]: boolean};
  playerColor: 'white' | 'black' | null;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  gameResult,
  reason,
  whiteScore,
  blackScore,
  currentGame,
  totalGames,
  onNextGame,
  readyForNextGame,
  playerColor
}) => {
  if (!isOpen) return null;

  const getResultText = () => {
    switch (reason) {
      case 'checkmate':
        return 'Jaque Mate';
      case 'timeout':
        return 'Tiempo Agotado';
      case 'draw':
        return 'Tablas';
      case 'resignation':
        return 'Abandono';
      default:
        return 'Partida Finalizada';
    }
  };

  const isMatchFinished = whiteScore > totalGames / 2 || blackScore > totalGames / 2;
  const hasConfirmed = playerColor ? readyForNextGame[playerColor] : false;
  const bothPlayersReady = readyForNextGame.white && readyForNextGame.black;

  const getButtonText = () => {
    if (!playerColor) return '';
    
    if (readyForNextGame[playerColor]) {
      return 'Esperando al oponente...';
    }
    
    if (readyForNextGame[playerColor === 'white' ? 'black' : 'white']) {
      return 'Comenzar siguiente partida';
    }
    
    return 'Listo para siguiente partida';
  };

  return (
    <div className="modal-overlay">
      <div className="game-over-modal">
        <h2>Fin de la Partida</h2>
        <div className="result-info">
          <p className="reason">{getResultText()}</p>
          <p className="score">Resultado: {gameResult}</p>
          <div className="match-score">
            <p>Puntuación del Match</p>
            <p className="score-numbers">
              {Number(whiteScore).toFixed(1)} - {Number(blackScore).toFixed(1)}
            </p>
          </div>
          {!isMatchFinished && currentGame < totalGames && (
            <button 
              className={`btn btn-primary next-game-btn ${hasConfirmed ? 'confirmed' : ''}`}
              onClick={onNextGame}
              disabled={hasConfirmed}
            >
              {getButtonText()}
            </button>
          )}
          {isMatchFinished && (
            <p className="match-finished">
              ¡Match finalizado! {whiteScore > blackScore ? 'Victoria Blancas' : 'Victoria Negras'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameOverModal; 