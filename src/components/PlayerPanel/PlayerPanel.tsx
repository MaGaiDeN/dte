interface PlayerPanelProps {
  username: string | null;
  rating?: number;
  color: 'white' | 'black';
  clock: React.ReactNode;
}

export const PlayerPanel = ({ username, rating = 1500, color, clock }: PlayerPanelProps) => {
  return (
    <div className={`player-box ${color} mb-3`}>
      <div className="row align-items-center w-100">
        <div className="col-auto">
          <div className="player-avatar">
            <i className="fas fa-user"></i>
          </div>
        </div>
        <div className="col">
          <div className="player-info">
            <span className="player-name text-white">
              {username || 'Esperando...'}
            </span>
            <span className="player-rating">
              <i className="fas fa-star me-1"></i>{rating}
            </span>
          </div>
        </div>
        <div className="col-auto">
          {clock}
        </div>
      </div>
    </div>
  );
}; 