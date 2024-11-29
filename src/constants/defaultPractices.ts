import type { Practice } from '../types/Habit';

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
    startDate: new Date().toISOString().split('T')[0]
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
    startDate: new Date().toISOString().split('T')[0]
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
    startDate: new Date().toISOString().split('T')[0]
  }
];