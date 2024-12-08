import { X, Bell } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { useState } from 'react';
import { NotificationSettings } from './NotificationSettings';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigurationModal({ isOpen, onClose }: ConfigurationModalProps) {
  const {
    notifications,
    privacy,
    toggleDailyReminders,
    toggleAchievementNotifications,
    togglePrivateMode,
    exportData,
    deleteAllData
  } = useConfig();

  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDeleteData = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
      try {
        setIsDeleting(true);
        await deleteAllData();
        onClose();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al eliminar los datos');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 p-4 sm:p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configuración
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Sección de Notificaciones */}
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Notificaciones
                  </h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <NotificationSettings />
                  <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={notifications.dailyReminders}
                        onChange={toggleDailyReminders}
                        className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 
                                 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Recordatorios diarios
                      </span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={notifications.achievementNotifications}
                        onChange={toggleAchievementNotifications}
                        className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 
                                 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Notificaciones de logros
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Privacidad */}
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Privacidad
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={privacy.privateMode}
                      onChange={togglePrivateMode}
                      className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 
                               focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Modo privado
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    El modo privado oculta información sensible y desactiva la sincronización de datos.
                  </p>
                </div>
              </div>
            </div>

            {/* Sección de Datos */}
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Datos
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleDeleteData}
                    disabled={isDeleting}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 
                             hover:bg-red-700 rounded-md disabled:opacity-50 
                             disabled:cursor-not-allowed transition-colors"
                  >
                    {isDeleting ? 'Eliminando...' : 'Eliminar todos los datos'}
                  </button>
                  <button
                    onClick={exportData}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 
                             hover:bg-indigo-700 rounded-md transition-colors"
                  >
                    Exportar datos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
