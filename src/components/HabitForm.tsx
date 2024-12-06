import { useState } from 'react';
import { Plus } from 'lucide-react';
import { HabitCategory, HabitFrequency } from '../types/Habit';

interface HabitFormProps {
  onAddHabit: (name: string, description: string, category: HabitCategory, frequency: HabitFrequency, customDays?: number[]) => void;
}

export function HabitForm({ onAddHabit }: HabitFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('personal');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);

  const categoryOptions: { value: HabitCategory; label: string }[] = [
    { value: 'health', label: 'Salud' },
    { value: 'work', label: 'Trabajo' },
    { value: 'learning', label: 'Aprendizaje' },
    { value: 'social', label: 'Social' },
    { value: 'personal', label: 'Personal' },
    { value: 'other', label: 'Otro' },
  ];

  const weekdays = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAddHabit(
      name, 
      description, 
      category, 
      frequency,
      frequency === 'custom' ? customDays : undefined
    );
    
    setName('');
    setDescription('');
    setCategory('personal');
    setFrequency('daily');
    setCustomDays([]);
  };

  const handleDayToggle = (day: number) => {
    setCustomDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <div>
        <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700">
          Nuevo Hábito
        </label>
        <input
          type="text"
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          placeholder="Ej: Meditar 10 minutos"
        />
      </div>

      <div>
        <label htmlFor="habit-description" className="block text-sm font-medium text-gray-700">
          Descripción (opcional)
        </label>
        <input
          type="text"
          id="habit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          placeholder="Ej: Cada mañana al despertar"
        />
      </div>

      <div>
        <label htmlFor="habit-category" className="block text-sm font-medium text-gray-700">
          Categoría
        </label>
        <select
          id="habit-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as HabitCategory)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
        >
          {categoryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="habit-frequency" className="block text-sm font-medium text-gray-700">
          Frecuencia
        </label>
        <select
          id="habit-frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
        >
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="custom">Días específicos</option>
        </select>
      </div>

      {frequency === 'custom' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selecciona los días
          </label>
          <div className="flex flex-wrap gap-2">
            {weekdays.map(day => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayToggle(day.value)}
                className={`px-3 py-1 rounded-full text-sm ${
                  customDays.includes(day.value)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Plus className="h-5 w-5 mr-2" />
        Añadir Hábito
      </button>
    </form>
  );
}