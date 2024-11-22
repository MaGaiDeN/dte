export interface TimeControlOption {
  name: string;
  time: number;
  increment: number;
}

export const TIME_CONTROL_OPTIONS: TimeControlOption[] = [
  { name: "Bullet", time: 1, increment: 0 },
  { name: "Bullet", time: 1, increment: 1 },
  { name: "Blitz", time: 3, increment: 0 },
  { name: "Blitz", time: 3, increment: 2 },
  { name: "Blitz", time: 5, increment: 0 },
  { name: "Blitz", time: 5, increment: 3 },
  { name: "Rápida", time: 10, increment: 0 },
  { name: "Rápida", time: 15, increment: 10 },
  { name: "Clásica", time: 30, increment: 0 }
]; 