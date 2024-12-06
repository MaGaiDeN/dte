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
      console.log('Redux Action: updatePractice - Previous state:', JSON.stringify(state.items));
      console.log('Redux Action: updatePractice - Payload:', JSON.stringify(action.payload));
      
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        // Create a deep copy of the practice object
        const updatedPractice = JSON.parse(JSON.stringify({
          ...action.payload,
          reflections: action.payload.reflections || {}
        }));
        
        // Create a new array with the updated practice
        const newItems = [
          ...state.items.slice(0, index),
          updatedPractice,
          ...state.items.slice(index + 1)
        ];
        
        // Update state and localStorage
        state.items = newItems;
        localStorage.setItem('practices', JSON.stringify(newItems));
        
        console.log('Redux Action: updatePractice - New state:', JSON.stringify(newItems));
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
