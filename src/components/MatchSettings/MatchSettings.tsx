import './MatchSettings.css';
import { MatchConfig } from './types/match';

interface MatchSettingsProps {
  config: MatchConfig;
  onChange: (config: MatchConfig) => void;
}

const MatchSettings = ({ config, onChange }: MatchSettingsProps) => {
  return (
    <div className="match-settings">
      <div className="setting-group">
        <h3>Tipo de Match</h3>
        <div className="toggle-group">
          <button 
            className={config.rated ? 'selected' : ''}
            onClick={() => onChange({ ...config, rated: true })}
          >
            Clasificatorio
          </button>
          <button 
            className={!config.rated ? 'selected' : ''}
            onClick={() => onChange({ ...config, rated: false })}
          >
            Amistoso
          </button>
        </div>
      </div>

      <div className="setting-group">
        <h3>Color de Piezas</h3>
        <div className="color-selector">
          <button 
            className={config.color === 'random' ? 'selected' : ''}
            onClick={() => onChange({ ...config, color: 'random' })}
          >
            <i className="fas fa-random"></i>
            Aleatorio
          </button>
          <button 
            className={config.color === 'white' ? 'selected' : ''}
            onClick={() => onChange({ ...config, color: 'white' })}
          >
            <i className="fas fa-chess-pawn"></i>
            Blancas
          </button>
          <button 
            className={config.color === 'black' ? 'selected' : ''}
            onClick={() => onChange({ ...config, color: 'black' })}
          >
            <i className="fas fa-chess-pawn chess-piece-black"></i>
            Negras
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchSettings; 