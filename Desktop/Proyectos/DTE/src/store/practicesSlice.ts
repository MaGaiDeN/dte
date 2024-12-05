import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Practice } from '../types/Habit';
import { DEFAULT_PRACTICES } from '../constants/defaultPractices';

interface PracticesState {
  items: Practice[];
  loading: boolean;
  error: string | null;
}

const initialState: PracticesState = {
  items: JSON.parse(localStorage.getItem('practices') || JSON.stringify(DEFAULT_PRACTICES)),
  loading: false,
  error: null,
};

export const practicesSlice = createSlice({
  name: 'practices',
  initialState,
  reducers: {
    setPractices: (state, action: PayloadAction<Practice[]>) => {
      console.log('Redux Action: setPractices', action.payload);
      state.items = action.payload;
      localStorage.setItem('practices', JSON.stringify(action.payload));
    },
    addPractice: (state, action: PayloadAction<Practice>) => {
      console.log('Redux Action: addPractice', action.payload);
      state.items.push(action.payload);
      localStorage.setItem('practices', JSON.stringify(state.items));
    },
    updatePractice: (state, action: PayloadAction<Practice>) => {
      console.log('Redux Action: updatePractice', action.payload);
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        localStorage.setItem('practices', JSON.stringify(state.items));
      }
    },
    deletePractice: (state, action: PayloadAction<string>) => {
      console.log('Redux Action: deletePractice', action.payload);
      state.items = state.items.filter(p => p.id !== action.payload);
      localStorage.setItem('practices', JSON.stringify(state.items));
    },
    resetPractices: (state) => {
      console.log('Redux Action: resetPractices');
      const today = new Date().toISOString().split('T')[0];
      const resetPractices = DEFAULT_PRACTICES.map(practice => ({
        ...practice,
        startDate: today,
        completedDates: [],
        progress: 0,
        currentStreak: 0,
        longestStreak: 0
      }));
      state.items = resetPractices;
      localStorage.setItem('practices', JSON.stringify(resetPractices));
    },
  },
});

export const {
  setPractices,
  addPractice,
  updatePractice,
  deletePractice,
  resetPractices,
} = practicesSlice.actions;

export default practicesSlice.reducer;
