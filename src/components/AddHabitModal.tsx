import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { NewPracticeForm, PracticeDuration, Practice } from '../types/Habit';
import { Modal } from './shared/Modal';
import { PRACTICE_TYPES } from '../constants/practices';

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

  const modalFooter = (
    <div className="flex justify-end space-x-4">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="habitForm"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Save className="h-4 w-4" />
        {editPractice ? 'Guardar Cambios' : 'Crear Práctica'}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editPractice ? 'Editar Práctica' : 'Nueva Práctica'}
      footer={modalFooter}
    >
      <form id="habitForm" onSubmit={handleSubmit} className="p-6 space-y-6">
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
            rows={2}
            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Describe tu práctica..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Práctica
          </label>
          <div className="grid grid-cols-1 gap-3">
            {PRACTICE_TYPES.map((type) => (
              <label
                key={type.type}
                className={`relative flex cursor-pointer rounded-lg border p-4 hover:border-indigo-300 ${
                  form.type === type.type
                    ? 'border-indigo-500 ring-2 ring-indigo-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="practice-type"
                  value={type.type}
                  checked={form.type === type.type}
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
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duración del Compromiso
          </label>
          <div className="grid grid-cols-1 gap-3">
            {DURATION_OPTIONS.map((option) => (
              <label
                key={option.value}
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
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="practice-observations" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Observaciones adicionales
          </label>
          <textarea
            id="practice-observations"
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Notas adicionales sobre la práctica..."
          />
        </div>
      </form>
    </Modal>
  );
}