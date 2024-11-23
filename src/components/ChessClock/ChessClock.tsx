import { useState, useEffect, useRef } from 'react';
import './ChessClock.css';

interface GameClockProps {
  timeInMinutes: number;
  increment: number;
  isActive: boolean;
  color: 'white' | 'black';
  onTimeout: () => void;
  onTimeUpdate: (time: number) => void;
  remainingTime: number;
}

const GameClock = ({
  timeInMinutes,
  increment,
  isActive,
  color,
  onTimeout,
  onTimeUpdate,
  remainingTime
}: GameClockProps) => {
  const [time, setTime] = useState(remainingTime || timeInMinutes * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTime(remainingTime || timeInMinutes * 60);
  }, [remainingTime, timeInMinutes]);

  useEffect(() => {
    if (isActive && time > 0) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime - 1;
          onTimeUpdate(newTime);
          return newTime;
        });
      }, 1000);
    } else if (!isActive && timerRef.current) {
      clearInterval(timerRef.current);
      if (increment > 0 && time > 0) {
        setTime(prevTime => {
          const newTime = prevTime + increment;
          onTimeUpdate(newTime);
          return newTime;
        });
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, increment]);

  useEffect(() => {
    if (time <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      onTimeout();
    }
  }, [time, onTimeout]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`game-clock ${color} ${isActive ? 'active' : ''}`}>
      {formatTime(time)}
    </div>
  );
};

export default GameClock; 