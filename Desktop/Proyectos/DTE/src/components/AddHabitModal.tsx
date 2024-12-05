import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Save } from 'lucide-react';
import { NewPracticeForm, PracticeDuration, Practice } from '../types/Habit';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: NewPracticeForm) => void;
  onEdit: (practice: Practice) => void;
  editPractice?: Practice | null;
}

const DURATION_OPTIONS: { value: PracticeDuration; label: string; description: string }[] = [
  { value: 30, label: '30 días', description: 'Ideal para establecer una base sólida' },
  { value: 60, label: '60 días', description: 'Para una práctica más profunda y sostenida' },
  { value: 90, label: '90 días', description: 'Compromiso profundo para transformación completa' },
];

const PRACTICE_TYPES = [
  { 
    value: 'meditation', 
    label: 'Meditación', 
    description: 'Práctica de respiración consciente y observación del momento presente' 
  },
  { 
    value: 'selfInquiry', 
    label: 'Autoindagación', 
    description: 'Observación sin juicios de pensamientos y emociones' 
  },
  { 
    value: 'contemplation', 
    label: 'Contemplación', 
    description: 'Práctica de presencia pura y disolución del ego' 
  }
];

export function AddHabitModal({ isOpen, onClose, onAdd, onEdit, editPractice }: AddHabitModalProps) {
  const [form, setForm] = useState<NewPracticeForm>({
    name: '',
    description: '',
    type: 'meditation',
    duration: 30,
    observations: '',
  });

  useEffect(() => {
    if (editPractice) {
      setForm({
        name: editPractice.name,
        description: editPractice.description || '',
        type: editPractice.type,
        duration: editPractice.duration,
        observations: editPractice.observations || '',
      });
    } else {
      setForm({
        name: '',
        description: '',
        type: 'meditation',
        duration: 30,
        observations: '',
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
        observations: form.observations,
      });
    } else {
      onAdd(form);
    }

    setForm({ name: '', description: '', type: 'meditation', duration: 30, observations: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden relative"
        >
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
            >
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
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors rounded-lg p-1"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-4rem)]">
            <form id="habitForm" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="practice-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre de la práctica
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
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
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  id="practice-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe tu práctica..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Práctica
                </label>
                <motion.div 
                  className="grid grid-cols-1 gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {PRACTICE_TYPES.map((type) => (
                    <motion.label
                      key={type.value}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`relative flex cursor-pointer rounded-lg border p-4 hover:border-indigo-300 ${
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
                      <div className="flex flex-col">
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                          {type.label}
                        </span>
                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {type.description}
                        </span>
                      </div>
                    </motion.label>
                  ))}
                </motion.div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duración del Compromiso
                </label>
                <motion.div 
                  className="grid grid-cols-1 gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {DURATION_OPTIONS.map((option) => (
                    <motion.label
                      key={option.value}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`relative flex cursor-pointer rounded-lg border p-4 hover:border-indigo-300 ${
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
                      <div className="flex flex-col">
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.label}
                        </span>
                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </span>
                      </div>
                    </motion.label>
                  ))}
                </motion.div>
              </div>

              <div>
                <label htmlFor="practice-observations" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Observaciones adicionales
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  id="practice-observations"
                  value={form.observations}
                  onChange={(e) => setForm({ ...form, observations: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Notas adicionales sobre la práctica..."
                />
              </div>
            </form>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 w-full sm:w-auto"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              form="habitForm"
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                {editPractice ? (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Crear Práctica
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}