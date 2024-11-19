import React from 'react';
import './GameCount.css';

interface GameCountProps {
  selectedCount: number;
  onChange: (count: number) => void;
}

const GameCount: React.FC<GameCountProps> = ({ selectedCount, onChange }) => {
  const gameCounts = [1, 3, 5, 7, 10];

  return (
    <div className="game-count-container">
      <h3>Número de partidas</h3>
      <div className="game-count-options">
        {gameCounts.map((count) => (
          <button
            key={count}
            className={`game-count-button ${selectedCount === count ? 'active' : ''}`}
            onClick={() => onChange(count)}
          >
            {count === 1 ? '1 partida' : `Al mejor de ${count}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameCount; 