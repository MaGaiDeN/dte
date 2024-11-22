import React from 'react';
import './MatchScoreTable.css';

interface MatchScoreTableProps {
  whitePlayer: string | null;
  blackPlayer: string | null;
  numberOfGames: number;
  results?: Array<'1-0' | '0-1' | '½-½' | null>;
  currentGame: number;
}

const MatchScoreTable: React.FC<MatchScoreTableProps> = ({
  whitePlayer,
  blackPlayer,
  numberOfGames,
  results = [],
  currentGame
}) => {
  console.log('MatchScoreTable props:', { whitePlayer, blackPlayer, numberOfGames, results, currentGame });

  return (
    <div className="match-score-table table-responsive">
      <table className="table table-dark table-bordered">
        <thead>
          <tr>
            <th scope="col" className="player-name">Jugador</th>
            {Array.from({ length: numberOfGames }, (_, i) => (
              <th 
                key={i} 
                scope="col" 
                className={`game-number text-center ${currentGame === i + 1 ? 'current' : ''}`}
              >
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="player-name">{whitePlayer || 'Blancas'}</td>
            {Array.from({ length: numberOfGames }, (_, i) => (
              <td 
                key={i} 
                className={`game-result text-center ${currentGame === i + 1 ? 'current' : ''}`}
              >
                {results[i] || '-'}
              </td>
            ))}
          </tr>
          <tr>
            <td className="player-name">{blackPlayer || 'Negras'}</td>
            {Array.from({ length: numberOfGames }, (_, i) => (
              <td 
                key={i} 
                className={`game-result text-center ${currentGame === i + 1 ? 'current' : ''}`}
              >
                {results[i] || '-'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MatchScoreTable; 