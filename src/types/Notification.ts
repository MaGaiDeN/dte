export interface NotificationSettings {
  enabled: boolean;
  time: string; // formato HH:mm
  sound: boolean;
}

export interface NotificationState {
  settings: NotificationSettings;
  permission: NotificationPermission;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
}
