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
  return (
    <div className="time-control">
      <h3>Control de Tiempo</h3>
      <div className="time-options">
        {options.map((option, index) => (
          <button
            key={index}
            className={`time-option ${selected === option ? 'selected' : ''}`}
            onClick={() => onSelect(option)}
          >
            <span className="time">
              {option.time}+{option.increment}
            </span>
            <span className="name">{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeControl; 