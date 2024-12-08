import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setNotificationSettings, setNotificationPermission } from '../store/notificationSlice';
import { requestNotificationPermission, scheduleNotification, showNotification } from '../services/notificationService';

export function NotificationSettings() {
  const dispatch = useAppDispatch();
  const { settings, permission } = useAppSelector(state => state.notifications);
  const practices = useAppSelector(state => state.practices.items);

  useEffect(() => {
    const checkPermission = async () => {
      const currentPermission = await requestNotificationPermission();
      dispatch(setNotificationPermission(currentPermission));
    };
    checkPermission();
  }, [dispatch]);

  useEffect(() => {
    if (settings.enabled && permission === 'granted') {
      const timerId = scheduleNotification(settings.time, () => {
        const pendingPractices = practices.filter(
          practice => !practice.completedDates.includes(new Date().toISOString().split('T')[0])
        );

        if (pendingPractices.length > 0) {
          showNotification({
            title: '¡Recordatorio de hábitos!',
            body: `Tienes ${pendingPractices.length} hábitos pendientes para hoy.`,
          });
        }
      });

      return () => clearTimeout(timerId);
    }
  }, [settings, permission, practices]);

  const handleToggleNotifications = async () => {
    if (!settings.enabled) {
      const permission = await requestNotificationPermission();
      dispatch(setNotificationPermission(permission));
      
      if (permission === 'granted') {
        dispatch(setNotificationSettings({ ...settings, enabled: true }));
      }
    } else {
      dispatch(setNotificationSettings({ ...settings, enabled: false }));
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setNotificationSettings({ ...settings, time: event.target.value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recibe recordatorios para completar tus hábitos
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="time"
            value={settings.time}
            onChange={handleTimeChange}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
            disabled={!settings.enabled}
          />
          <button
            onClick={handleToggleNotifications}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              settings.enabled
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            {settings.enabled ? 'Activado' : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  );
}
