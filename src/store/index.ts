import { configureStore } from '@reduxjs/toolkit';
import practicesReducer from './practicesSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    practices: practicesReducer,
    notifications: notificationReducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
