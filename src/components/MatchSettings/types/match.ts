export interface TimeControlOption {
  time: number;
  increment: number;
  name: string;
}

export interface MatchConfig {
  timeControl: TimeControlOption;
  numberOfGames: number;
  rated: boolean;
  color: 'random' | 'white' | 'black';
}

// Opciones predefinidas de control de tiempo
export const TIME_CONTROL_OPTIONS: TimeControlOption[] = [
  { time: 1, increment: 0, name: 'Bullet' },
  { time: 3, increment: 0, name: 'Blitz' },
  { time: 3, increment: 2, name: 'Blitz' },
  { time: 5, increment: 0, name: 'Blitz' },
  { time: 5, increment: 3, name: 'Blitz' },
  { time: 10, increment: 0, name: 'Rápida' },
  { time: 15, increment: 10, name: 'Rápida' },
];

// Configuración inicial por defecto
export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  timeControl: TIME_CONTROL_OPTIONS.find(opt => opt.time === 3 && opt.increment === 2) || TIME_CONTROL_OPTIONS[0],
  numberOfGames: 1,
  rated: true,
  color: 'random'
}; 