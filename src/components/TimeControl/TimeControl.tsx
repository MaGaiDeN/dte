import { TimeControlOption, TIME_CONTROL_OPTIONS } from '../MatchSettings/types/match';
import './TimeControl.css';

interface TimeControlProps {
  selectedOption: TimeControlOption;
  options: TimeControlOption[];
  onChange: (option: TimeControlOption) => void;
}

const TimeControl = ({ selectedOption, options, onChange }: TimeControlProps) => {
  const timeCategories = Array.from(new Set(options.map(opt => opt.name)));

  return (
    <div className="time-control">
      <h3>Control de Tiempo</h3>
      {timeCategories.map(category => (
        <div key={category} className="time-category">
          <span>{category}</span>
          <div className="time-category-options">
            {options
              .filter(opt => opt.name === category)
              .map(opt => (
                <button
                  key={`${opt.time}-${opt.increment}`}
                  className={`time-option ${
                    opt.time === selectedOption.time && 
                    opt.increment === selectedOption.increment ? 'selected' : ''
                  }`}
                  onClick={() => onChange(opt)}
                >
                  <span className="time">{`${opt.time}+${opt.increment}`}</span>
                  <span className="name">{opt.name}</span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimeControl; 