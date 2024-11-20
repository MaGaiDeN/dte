import { useState, useEffect } from 'react';
import './ChessClock.css';

interface ChessClockProps {
  timeInMinutes: number;
  increment: number;
  isActive: boolean;
  color: 'white' | 'black';
  onTimeout: () => void;
}

const GameClock: React.FC<ChessClockProps> = ({ timeInMinutes, increment, isActive, color, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(timeInMinutes * 60);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            onTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isActive) {
      setTimeLeft(prev => prev + increment);
    }

    return () => clearInterval(timer);
  }, [isActive, timeLeft, onTimeout, increment]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`chess-clock ${color} ${isActive ? 'active' : ''}`}>
      {formatTime(timeLeft)}
    </div>
  );
};

export default GameClock; 