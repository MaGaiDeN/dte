import { useState } from 'react';
import type { Reflection } from '../types';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { dailyMeditations } from '../data/dailyMeditations';

interface MeditationChallengeFormProps {
  onSaveReflection: (reflection: Omit<Reflection, 'id' | 'date'>) => void;
  dayNumber: number;
  onClose: () => void;
}

export function MeditationChallengeForm({ onSaveReflection, dayNumber, onClose }: MeditationChallengeFormProps) {
  const [observations, setObservations] = useState('');
  const [duration, setDuration] = useState(20); // Default meditation duration in minutes
  
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
        insights: '',
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
      isEmpty: !observations
    };

    onSaveReflection(reflection);
    onClose();
  };

  // Calcular el día del reto (1-30)
  const challengeDay = Math.max(1, Math.min(dayNumber, 30)); // Asegurarnos de que esté entre 1 y 30
  const dailyMeditation = dailyMeditations[challengeDay] || dailyMeditations[1];
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
                Reto de Meditación - Día {challengeDay}/30
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
          
          {dailyMeditation && (
            <div className="mb-6 space-y-4">
              <div className="text-white text-sm">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  {dailyMeditation.title}
                </h3>
                <p className="text-gray-300">{dailyMeditation.description}</p>
              </div>
              <div className="text-white text-sm">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Práctica del día:
                </h3>
                <p className="text-gray-300">{dailyMeditation.practice}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Duración de la meditación (minutos)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="1"
                  max="180"
                  className="w-full px-3 py-2 text-white bg-slate-800 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Observaciones y reflexiones
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full h-32 px-3 py-2 text-white bg-slate-800 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="¿Cómo te has sentido durante la meditación? ¿Qué has observado?"
                />
              </div>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
