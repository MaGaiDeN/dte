import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NotificationSettings, NotificationState } from '../types/Notification';

const defaultSettings: NotificationSettings = {
  enabled: false,
  time: '09:00',
  sound: true,
};

const initialState: NotificationState = {
  settings: JSON.parse(localStorage.getItem('notificationSettings') || JSON.stringify(defaultSettings)),
  permission: 'default',
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationSettings: (state, action: PayloadAction<NotificationSettings>) => {
      state.settings = action.payload;
      localStorage.setItem('notificationSettings', JSON.stringify(action.payload));
    },
    setNotificationPermission: (state, action: PayloadAction<NotificationPermission>) => {
      state.permission = action.payload;
    },
  },
});

export const { setNotificationSettings, setNotificationPermission } = notificationSlice.actions;

export default notificationSlice.reducer;
