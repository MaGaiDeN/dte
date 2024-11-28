import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NewPracticeForm, PracticeDuration, Practice } from '../types/Habit';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: NewPracticeForm) => void;
  onEdit?: (practice: Practice) => void;
  editPractice?: Practice;
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

    if (editPractice && onEdit) {
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

  const isEditMode = Boolean(editPractice);
  const selectedPracticeType = PRACTICE_TYPES.find(type => type.value === form.type);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-xl z-50 overflow-hidden"
                initial={{ scale: 0.95, opacity: 0, y: '-48%' }}
                animate={{ scale: 1, opacity: 1, y: '-50%' }}
                exit={{ scale: 0.95, opacity: 0, y: '-48%' }}
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    {isEditMode ? (
                      <>
                        <Save className="h-5 w-5 text-indigo-600" />
                        Editar Práctica
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 text-indigo-600" />
                        Nueva Práctica
                      </>
                    )}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Práctica
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {PRACTICE_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setForm({ ...form, type: type.value })}
                          className={`p-4 text-left rounded-lg border transition-all ${
                            form.type === type.value
                              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                              : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{type.label}</div>
                          <div className="text-sm text-gray-500 mt-1">{type.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Práctica
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={selectedPracticeType?.label || "Nombre de la práctica"}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={selectedPracticeType?.description || "Describe tu práctica..."}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Duración del Plan
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {DURATION_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setForm({ ...form, duration: option.value })}
                          className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                            form.duration === option.value
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {isEditMode ? 'Guardar Cambios' : 'Crear Práctica'}
                      </span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}