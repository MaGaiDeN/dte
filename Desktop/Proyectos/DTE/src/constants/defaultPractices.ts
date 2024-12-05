import type { Practice } from '../types/Habit';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const DEFAULT_PRACTICES: Practice[] = [
  {
    id: '1',
    type: 'meditation',
    name: 'Meditación Diaria',
    description: 'Práctica de respiración consciente y observación del momento presente',
    color: '#6366F1', // Indigo
    progress: 0,
    completedDates: [],
    currentStreak: 0,
    longestStreak: 0,
    duration: 30,
    startDate: getTodayDate() // Use today's date
  },
  {
    id: '2',
    type: 'selfInquiry',
    name: 'Autoindagación',
    description: 'Observación sin juicios de pensamientos y emociones',
    color: '#8B5CF6', // Purple
    progress: 0,
    completedDates: [],
    currentStreak: 0,
    longestStreak: 0,
    duration: 30,
    startDate: getTodayDate() // Use today's date
  },
  {
    id: '3',
    type: 'contemplation',
    name: 'Contemplación',
    description: 'Práctica de vaciado mental y claridad interior',
    color: '#EC4899', // Pink
    progress: 0,
    completedDates: [],
    currentStreak: 0,
    longestStreak: 0,
    duration: 30,
    startDate: getTodayDate() // Use today's date
  }
];