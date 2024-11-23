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
  // Memoizar los resultados para evitar recálculos innecesarios
  const scores = React.useMemo(() => {
    // Crear una copia del array para evitar mutaciones
    const validResults = [...results].filter(result => result !== null);
    
    const whiteScore = validResults.reduce((total, result) => {
      if (!result) return total;
      if (result === '1-0') return total + 1;
      if (result === '½-½') return total + 0.5;
      if (result === '0-1') return total + 0;
      return total;
    }, 0);

    const blackScore = validResults.reduce((total, result) => {
      if (!result) return total;
      if (result === '0-1') return total + 1;
      if (result === '½-½') return total + 0.5;
      if (result === '1-0') return total + 0;
      return total;
    }, 0);

    // Forzar el número a tener un decimal fijo
    return { 
      whiteScore: Number(whiteScore.toFixed(1)), 
      blackScore: Number(blackScore.toFixed(1))
    };
  }, [results]); // Dependencia única en results

  // Evitar re-renders innecesarios memorizando el componente completo
  return React.useMemo(() => (
    <div className="match-score-table">
      <table>
        <thead>
          <tr>
            <th className="player-column">Jugador</th>
            {Array.from({ length: numberOfGames }, (_, i) => (
              <th key={i} className={`game-column ${i + 1 === currentGame ? 'current' : ''}`}>
                {i + 1}
              </th>
            ))}
            <th className="total-column">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="player-column">{whitePlayer || 'Blancas'}</td>
            {Array.from({ length: numberOfGames }, (_, i) => (
              <td key={i} className={`game-column ${i + 1 === currentGame ? 'current' : ''}`}>
                {results[i] === '1-0' ? '1' : 
                 results[i] === '0-1' ? '0' : 
                 results[i] === '½-½' ? '½' : '-'}
              </td>
            ))}
            <td className="total-column">{scores.whiteScore.toFixed(1)}</td>
          </tr>
          <tr>
            <td className="player-column">{blackPlayer || 'Negras'}</td>
            {Array.from({ length: numberOfGames }, (_, i) => (
              <td key={i} className={`game-column ${i + 1 === currentGame ? 'current' : ''}`}>
                {results[i] === '0-1' ? '1' : 
                 results[i] === '1-0' ? '0' : 
                 results[i] === '½-½' ? '½' : '-'}
              </td>
            ))}
            <td className="total-column">{scores.blackScore.toFixed(1)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  ), [whitePlayer, blackPlayer, numberOfGames, results, currentGame, scores]);
};

export default MatchScoreTable; 