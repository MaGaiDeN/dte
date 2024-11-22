export const playGameStartSound = () => {
  const audio = new Audio('/sounds/game-start.mp3');
  audio.play().catch(err => console.error('Error reproduciendo sonido:', err));
}; 