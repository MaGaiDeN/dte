import React from 'react';
import './TimeControl.css';

interface TimeControlOption {
  time: number;
  increment: number;
  name: string;
}

interface TimeControlProps {
  options: TimeControlOption[];
  selected: TimeControlOption;
  onSelect: (option: TimeControlOption) => void;
}

const TimeControl = ({ options, selected, onSelect }: TimeControlProps) => {
  const categories = ['Bullet', 'Blitz', 'Rápida', 'Clásica'];
  
  return (
    <div className="time-control">
      <h3>Control de Tiempo</h3>
      <div className="time-options">
        {categories.map(category => (
          <React.Fragment key={category}>
            <div className="time-category">{category}</div>
            <div className="time-category-options">
              {options
                .filter(option => option.name === category)
                .map((option, index) => (
                  <button
                    key={`${option.time}-${option.increment}-${index}`}
                    className={`time-option ${selected === option ? 'selected' : ''}`}
                    onClick={() => onSelect(option)}
                  >
                    <span className="time">
                      {option.time}+{option.increment}
                    </span>
                  </button>
                ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimeControl; 