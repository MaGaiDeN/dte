import React from 'react';
import './MatchScoreTable.css';

interface MatchScoreTableProps {
  whitePlayer: string | null;
  blackPlayer: string | null;
  numberOfGames: number;
  results?: Array<'1-0' | '0-1' | '½-½' | null>;
  currentGame: number;
}

const MatchScoreTable = ({ whitePlayer, blackPlayer, numberOfGames, results = [], currentGame }: MatchScoreTableProps) => {
  const scores = React.useMemo(() => {
    const validResults = [...results].filter(result => result !== null);
    
    const whiteScore = validResults.reduce((total, result) => {
      if (!result) return total;
      if (result === '1-0') return total + 1;
      if (result === '0-1') return total + 0;
      if (result === '½-½') return total + 0.5;
      return total;
    }, 0);

    const blackScore = validResults.reduce((total, result) => {
      if (!result) return total;
      if (result === '0-1') return total + 1;
      if (result === '1-0') return total + 0;
      if (result === '½-½') return total + 0.5;
      return total;
    }, 0);

    return { 
      whiteScore: Number(whiteScore.toFixed(1)), 
      blackScore: Number(blackScore.toFixed(1))
    };
  }, [results]);

  return (
    <div className="table-responsive">
      <table className="table table-dark table-bordered align-middle">
        <thead>
          <tr>
            <th scope="col">Jugador</th>
            {Array(numberOfGames).fill(null).map((_, index) => (
              <th key={index} scope="col" className="text-center">
                {index + 1}
              </th>
            ))}
            <th scope="col" className="text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className={currentGame % 2 === 1 ? 'table-active' : ''}>
            <th scope="row" className="text-white">
              <i className="fas fa-chess-king text-white me-2"></i>
              {whitePlayer}
            </th>
            {Array(numberOfGames).fill(null).map((_, index) => (
              <td key={index} className={`text-center ${index + 1 === currentGame ? 'current-game' : ''}`}>
                {results[index] ? 
                  (results[index] === '1-0' ? '1' : 
                   results[index] === '0-1' ? '0' : 
                   '½') : '-'}
              </td>
            ))}
            <td className="text-center fw-bold">{scores.whiteScore}</td>
          </tr>
          <tr className={currentGame % 2 === 0 ? 'table-active' : ''}>
            <th scope="row" className="text-white">
              <i className="fas fa-chess-king text-secondary me-2"></i>
              {blackPlayer}
            </th>
            {Array(numberOfGames).fill(null).map((_, index) => (
              <td key={index} className={`text-center ${index + 1 === currentGame ? 'current-game' : ''}`}>
                {results[index] ? 
                  (results[index] === '0-1' ? '1' : 
                   results[index] === '1-0' ? '0' : 
                   '½') : '-'}
              </td>
            ))}
            <td className="text-center fw-bold">{scores.blackScore}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(MatchScoreTable); 