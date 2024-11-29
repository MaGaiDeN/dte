import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NewPracticeForm, PracticeDuration, Practice } from '../types/Habit';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: NewPracticeForm) => void;
  onEdit: (practice: Practice) => void;
  editPractice?: Practice | null;
}

const DURATION_OPTIONS: { value: PracticeDuration; label: string }[] = [
  { value: 30, label: '30 días' },
  { value: 60, label: '60 días' },
  { value: 90, label: '90 días' },
];

const PRACTICE_TYPES = [
  { value: 'meditation', label: 'Meditación', description: 'Práctica de respiración consciente y observación del momento presente' },
  { value: 'selfInquiry', label: 'Autoindagación', description: 'Observación sin juicios de pensamientos y emociones' },
  { value: 'contemplation', label: 'Contemplación', description: 'Práctica de presencia pura y disolución del ego' }
];

export function AddHabitModal({ isOpen, onClose, onAdd, onEdit, editPractice }: AddHabitModalProps) {
  const [form, setForm] = useState<NewPracticeForm>({
    name: '',
    description: '',
    type: 'meditation',
    duration: 30,
  });

  useEffect(() => {
    if (editPractice) {
      setForm({
        name: editPractice.name,
        description: editPractice.description || '',
        type: editPractice.type,
        duration: editPractice.duration,
      });
    } else {
      setForm({
        name: '',
        description: '',
        type: 'meditation',
        duration: 30,
      });
    }
  }, [editPractice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.type) return;

    if (editPractice) {
      onEdit({
        ...editPractice,
        name: form.name,
        description: form.description,
        type: form.type,
        duration: form.duration,
      });
    } else {
      onAdd(form);
    }

    setForm({ name: '', description: '', type: 'meditation', duration: 30 });
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
              {editPractice ? (
                <>
                  <Save className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Editar Práctica
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Nueva Práctica
                </>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors rounded-lg p-1"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <form id="habitForm" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="practice-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre de la práctica
                </label>
                <input
                  type="text"
                  id="practice-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Ej: Meditación matutina"
                />
              </div>

              <div>
                <label htmlFor="practice-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción (opcional)
                </label>
                <textarea
                  id="practice-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe tu práctica..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de práctica
                </label>
                <div className="mt-2 grid grid-cols-1 gap-3">
                  {PRACTICE_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`relative flex cursor-pointer rounded-lg border p-4 ${
                        form.type === type.value
                          ? 'border-indigo-500 ring-2 ring-indigo-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="practice-type"
                        value={type.value}
                        checked={form.type === type.value}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="sr-only"
                      />
                      <div className="flex flex-1">
                        <div className="flex flex-col">
                          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            {type.label}
                          </span>
                          <span className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            {type.description}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duración del compromiso
                </label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {DURATION_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`relative flex cursor-pointer rounded-lg border p-4 ${
                        form.duration === option.value
                          ? 'border-indigo-500 ring-2 ring-indigo-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="practice-duration"
                        value={option.value}
                        checked={form.duration === option.value}
                        onChange={(e) => setForm({ ...form, duration: Number(e.target.value) as PracticeDuration })}
                        className="sr-only"
                      />
                      <div className="flex flex-1 justify-center">
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
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
              form="habitForm"
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                {editPractice ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editPractice ? 'Guardar Cambios' : 'Crear Práctica'}
              </span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}