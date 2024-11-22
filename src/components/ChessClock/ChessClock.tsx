import { useState, useEffect, useCallback } from 'react';
import './ChessClock.css';

interface GameClockProps {
  timeInMinutes: number;
  increment: number;
  isActive: boolean;
  color: 'white' | 'black';
  onTimeout: () => Promise<void>;
  onTimeUpdate: (time: number) => void;
  remainingTime: number;
}

const GameClock: React.FC<GameClockProps> = ({
  timeInMinutes,
  increment,
  isActive,
  color,
  onTimeout,
  onTimeUpdate,
  remainingTime
}) => {
  const [time, setTime] = useState(remainingTime);

  useEffect(() => {
    setTime(remainingTime);
  }, [remainingTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime - 1;
          onTimeUpdate(newTime);
          if (newTime <= 0) {
            onTimeout();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, onTimeout, onTimeUpdate]);

  const getClockClasses = () => {
    const classes = ['game-clock'];
    if (isActive) classes.push('active');
    if (time < 30) classes.push('warning');
    return classes.join(' ');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={getClockClasses()}>
      {formatTime(time)}
    </div>
  );
};

export default GameClock; 