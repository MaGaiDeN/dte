import { useState, useEffect, useCallback } from 'react';
import './ChessClock.css';

interface ChessClockProps {
  timeInMinutes: number;
  increment: number;
  isActive: boolean;
  color: 'white' | 'black';
  onTimeout: () => void;
  onTimeUpdate?: (time: number) => void;
}

const ChessClock: React.FC<ChessClockProps> = ({
  timeInMinutes,
  increment,
  isActive,
  color,
  onTimeout,
  onTimeUpdate
}) => {
  const [timeLeft, setTimeLeft] = useState(timeInMinutes * 60);
  const [lastTickTime, setLastTickTime] = useState<number | null>(null);
  
  const tick = useCallback(() => {
    const now = Date.now();
    if (lastTickTime) {
      const delta = (now - lastTickTime) / 1000;
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - delta);
        onTimeUpdate?.(newTime);
        return newTime;
      });
    }
    setLastTickTime(now);
  }, [lastTickTime, onTimeUpdate]);

  useEffect(() => {
    let timer: number;
    
    if (isActive && timeLeft > 0) {
      timer = window.requestAnimationFrame(function updateClock() {
        tick();
        timer = window.requestAnimationFrame(updateClock);
      });
    } else if (!isActive && lastTickTime) {
      setTimeLeft(prev => prev + increment);
      setLastTickTime(null);
    }

    if (timeLeft <= 0) {
      onTimeout();
    }

    return () => {
      if (timer) {
        window.cancelAnimationFrame(timer);
      }
    };
  }, [isActive, timeLeft, increment, tick, onTimeout, lastTickTime]);

  const formatTime = (seconds: number) => {
    if (seconds < 10) {
      return seconds.toFixed(1);
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`chess-clock ${color} ${isActive ? 'active' : ''}`}>
      {formatTime(timeLeft)}
    </div>
  );
};

export default ChessClock; 