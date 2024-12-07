import { useState } from 'react';
import type { Reflection } from '../types';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ReflectionFormProps {
  onSaveReflection: (reflection: Omit<Reflection, 'id' | 'date'>) => void;
  dayNumber: number;
  practiceType: 'meditation' | 'inquiry' | 'contemplation';
  onClose: () => void;
}

const getDayText = (dayNumber: number, type: 'meditation' | 'inquiry' | 'contemplation') => {
  // Return empty string for the first three days
  if (dayNumber <= 3) {
    return '';
  }

  // For days after day 3, use the existing texts
  const texts = {
    meditation: [
      "Día 1: Observa tu respiración",
      "Día 2: Siente tu cuerpo",
      // ... más textos
    ],
    inquiry: [
      "Día 1: ¿Quién soy yo?",
      "Día 2: ¿Qué es lo que realmente busco?",
      // ... más textos
    ],
    contemplation: [
      "Día 1: Contempla la naturaleza de la mente",
      "Día 2: Observa el espacio de la consciencia",
      // ... más textos
    ]
  };

  return texts[type][dayNumber - 4] || `Día ${dayNumber}`;
};

export function ReflectionForm({ onSaveReflection, dayNumber, practiceType, onClose }: ReflectionFormProps) {
  const [insights, setInsights] = useState('');
  const [observations, setObservations] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reflection = {
      event: {
        description: '',
        emotionalResponse: ''
      },
      beliefs: {
        self: [],
        others: [],
        life: []
      },
      contemplation: {
        level: 'deep' as const,
        insights: insights,
        question: ''
      },
      transformation: {
        limitingBelief: '',
        newPerspective: observations
      },
      practices: {
        breathingExercise: false,
        witnessPresence: false,
        mentalClearing: false,
        selfInquiry: false
      },
      isEmpty: !insights && !observations
    };

    onSaveReflection(reflection);
    onClose();
  };

  return (
    <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 rounded-lg p-6 w-full max-w-md shadow-xl">
      <Dialog.Title className="text-xl font-semibold mb-4 text-white">
        {getDayText(dayNumber, practiceType)}
      </Dialog.Title>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Insights del día
          </label>
          <textarea
            value={insights}
            onChange={(e) => setInsights(e.target.value)}
            className="w-full h-32 px-3 py-2 text-white bg-slate-800 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="¿Qué has descubierto hoy durante tu práctica?"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Observaciones adicionales
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full h-24 px-3 py-2 text-white bg-slate-800 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Cualquier otra observación o nota que quieras añadir..."
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-md hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
          >
            Guardar
          </button>
        </div>
      </form>

      <Dialog.Close asChild>
        <button
          className="absolute top-4 right-4 text-white hover:text-gray-300"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </Dialog.Close>
    </Dialog.Content>
  );
}