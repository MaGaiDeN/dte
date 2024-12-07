import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ConfigContextType {
  notifications: {
    dailyReminders: boolean;
    achievementNotifications: boolean;
  };
  privacy: {
    privateMode: boolean;
  };
  toggleDailyReminders: () => void;
  toggleAchievementNotifications: () => void;
  togglePrivateMode: () => void;
  exportData: () => void;
  deleteAllData: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useState<ConfigContextType>(() => {
    const savedConfig = localStorage.getItem('dte-config');
    return savedConfig ? JSON.parse(savedConfig) : {
      notifications: {
        dailyReminders: true,
        achievementNotifications: true,
      },
      privacy: {
        privateMode: false,
      },
    };
  });

  useEffect(() => {
    localStorage.setItem('dte-config', JSON.stringify(config));
  }, [config]);

  const toggleDailyReminders = () => {
      setConfig((prev: ConfigContextType) => ({
          ...prev,
          notifications: {
              ...prev.notifications,
              dailyReminders: !prev.notifications.dailyReminders,
          },
      }));
  };

  const toggleAchievementNotifications = () => {
      setConfig((prev: ConfigContextType) => ({
          ...prev,
          notifications: {
              ...prev.notifications,
              achievementNotifications: !prev.notifications.achievementNotifications,
          },
      }));
  };

  const togglePrivateMode = () => {
    setConfig((prev: ConfigContextType) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        privateMode: !prev.privacy.privateMode,
      },
    }));
  };

  const exportData = () => {
    try {
      // Recopilar todos los datos de localStorage
      const data = {
        config,
        practices: localStorage.getItem('practices'),
        reflections: localStorage.getItem('reflections'),
        // Añadir más datos según sea necesario
      };

      // Crear y descargar el archivo
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dte-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error al exportar los datos. Por favor, inténtalo de nuevo.');
    }
  };

  const deleteAllData = async () => {
    try {
      // Save theme before clearing
      const theme = localStorage.getItem('theme');
      
      // Batch localStorage operations
      const keysToPreserve = ['theme'];
      const keysToRemove = Object.keys(localStorage).filter(key => !keysToPreserve.includes(key));
      
      // Remove items in a single batch
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Restore preserved items
      if (theme) localStorage.setItem('theme', theme);

      // Update config state without triggering unnecessary re-renders
      const defaultConfig = {
        notifications: {
          dailyReminders: true,
          achievementNotifications: true,
        },
        privacy: {
          privateMode: false,
        },
        toggleDailyReminders,
        toggleAchievementNotifications,
        togglePrivateMode,
        exportData,
        deleteAllData,
      };

      setConfig(defaultConfig);

      // Use location.replace instead of reload for a smoother transition
      window.location.replace(window.location.href);
    } catch (error) {
      console.error('Error deleting data:', error);
      throw new Error('Error al eliminar los datos. Por favor, inténtalo de nuevo.');
    }
  };

  const value = {
    ...config,
    toggleDailyReminders,
    toggleAchievementNotifications,
    togglePrivateMode,
    exportData,
    deleteAllData,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
