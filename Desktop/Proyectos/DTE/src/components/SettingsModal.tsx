import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
    observations: string;
  }) => void;
  currentSettings?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
    observations: string;
  };
}

export function SettingsModal({ isOpen, onClose, onSave, currentSettings }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'es',
    observations: '',
  });

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full sm:w-[95vw] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-white dark:bg-gray-800 shadow-xl rounded-xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Configuración
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors rounded-lg p-1"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <form id="settingsForm" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Activar notificaciones</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Modo oscuro</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label htmlFor="settings-observations" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Observaciones generales
                </label>
                <textarea
                  id="settings-observations"
                  value={settings.observations}
                  onChange={(e) => setSettings({ ...settings, observations: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Notas y observaciones generales sobre la aplicación..."
                />
              </div>
            </form>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="settingsForm"
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                <Save className="h-4 w-4" />
                Guardar Cambios
              </span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}