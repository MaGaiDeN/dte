import { useState } from 'react';
import type { Reflection } from '../types';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { dailyContemplations } from '../data/dailyContemplations';

interface ContemplationChallengeFormProps {
  onSaveReflection: (reflection: Omit<Reflection, 'id' | 'date'>) => void;
  dayNumber: number;
  onClose: () => void;
}

export function ContemplationChallengeForm({ onSaveReflection, dayNumber, onClose }: ContemplationChallengeFormProps) {
  const [observations, setObservations] = useState('');
  const [duration, setDuration] = useState(20); // Default contemplation duration in minutes
  
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
        insights: observations,
        question: ''
      },
      transformation: {
        limitingBelief: '',
        newPerspective: ''
      },
      practices: {
        breathingExercise: false,
        witnessPresence: true,
        mentalClearing: false,
        selfInquiry: true
      },
      isEmpty: !observations
    };

    onSaveReflection(reflection);
    onClose();
  };

  // Calcular el día del reto (1-30)
  const challengeDay = Math.max(1, Math.min(dayNumber, 30));
  const dailyContemplation = dailyContemplations[challengeDay] || dailyContemplations[1];
  const progress = (challengeDay / 30) * 100;

  return (
    <Dialog.Root open={true} onOpenChange={() => onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 dark:bg-black/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 rounded-lg p-6 w-full max-w-md shadow-xl">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Reto de Contemplación - Día {challengeDay}/30
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="text-white hover:text-gray-300"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {dailyContemplation && (
            <div className="mb-6 space-y-4">
              <div className="text-white text-sm">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  {dailyContemplation.title}
                </h3>
                <p className="text-gray-300">{dailyContemplation.description}</p>
              </div>
              <div className="text-white text-sm">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Práctica del día:
                </h3>
                <p className="text-gray-300">{dailyContemplation.practice}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duración de la práctica
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="block w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value={10}>10 minutos</option>
                <option value={20}>20 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={40}>40 minutos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observaciones y reflexiones
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={4}
                className="block w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Escribe aquí tus observaciones y reflexiones..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Guardar
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
