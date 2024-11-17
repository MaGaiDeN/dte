import React from 'react';

interface SquareProps {
  isBlack: boolean;
  position: {
    row: number;
    col: number;
  };
}

const Square: React.FC<SquareProps> = ({ isBlack }) => {
  return (
    <div 
      className={`square ${isBlack ? 'black' : 'white'}`}
      style={{ width: '50px', height: '50px' }}
    >
    </div>
  );
};

export default Square; 