import { X, BookOpen, Brain, Flower2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TRANSFORMATION_SHORTCUTS } from '../types/Reflection';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  practiceId: string;
  onSave: (reflection: {
    practiceId: string;
    date: string;
    event: {
      description: string;
      emotionalResponse: string;
    };
    beliefs: {
      self: string[];
      others: string[];
      life: string[];
    };
    contemplation: {
      level: 'superficial' | 'deep';
      insights: string;
      question: string;
    };
    transformation: {
      limitingBelief: string;
      newPerspective: string;
      doorMoment?: string;
    };
    practices: {
      breathingExercise: boolean;
      witnessPresence: boolean;
      mentalClearing: boolean;
      selfInquiry: boolean;
    };
    isEmpty: boolean;
  }) => void;
}

export function ReflectionModal({ isOpen, onClose, date, practiceId, onSave }: ReflectionModalProps) {
  const [event, setEvent] = useState('');
  const [emotionalResponse, setEmotionalResponse] = useState('');
  const [insights, setInsights] = useState('');
  const [level, setLevel] = useState<'superficial' | 'deep'>('superficial');
  const [limitingBelief, setLimitingBelief] = useState('');
  const [newPerspective, setNewPerspective] = useState('');
  const [practices, setPractices] = useState({
    breathingExercise: false,
    witnessPresence: false,
    mentalClearing: false,
    selfInquiry: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEmpty = !event && !emotionalResponse && !insights && !limitingBelief && !newPerspective &&
      !Object.values(practices).some(Boolean);

    onSave({
      practiceId,
      date,
      event: {
        description: event,
        emotionalResponse,
      },
      beliefs: {
        self: [],
        others: [],
        life: [],
      },
      contemplation: {
        level,
        insights,
        question: '',
      },
      transformation: {
        limitingBelief,
        newPerspective,
      },
      practices,
      isEmpty,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-gray-800 rounded-xl shadow-xl flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Reflexión del {new Date(date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors rounded-lg p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <form id="reflectionForm" onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prácticas Realizadas
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative flex items-start">
                    <input
                      type="checkbox"
                      checked={practices.breathingExercise}
                      onChange={(e) => setPractices({ ...practices, breathingExercise: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Respiración Consciente
                    </span>
                  </label>
                  <label className="relative flex items-start">
                    <input
                      type="checkbox"
                      checked={practices.witnessPresence}
                      onChange={(e) => setPractices({ ...practices, witnessPresence: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Presencia Testigo
                    </span>
                  </label>
                  <label className="relative flex items-start">
                    <input
                      type="checkbox"
                      checked={practices.mentalClearing}
                      onChange={(e) => setPractices({ ...practices, mentalClearing: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Vaciado Mental
                    </span>
                  </label>
                  <label className="relative flex items-start">
                    <input
                      type="checkbox"
                      checked={practices.selfInquiry}
                      onChange={(e) => setPractices({ ...practices, selfInquiry: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Autoindagación
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="event" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Evento o Situación
                </label>
                <textarea
                  id="event"
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe el evento o situación que desencadenó la práctica..."
                />
              </div>

              <div>
                <label htmlFor="emotional-response" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Respuesta Emocional
                </label>
                <textarea
                  id="emotional-response"
                  value={emotionalResponse}
                  onChange={(e) => setEmotionalResponse(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="¿Qué emociones surgieron?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nivel de Contemplación
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <label className={`relative flex cursor-pointer rounded-lg border p-4 ${
                    level === 'superficial'
                      ? 'border-indigo-500 ring-2 ring-indigo-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      name="contemplation-level"
                      value="superficial"
                      checked={level === 'superficial'}
                      onChange={(e) => setLevel(e.target.value as 'superficial' | 'deep')}
                      className="sr-only"
                    />
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Superficial
                      </span>
                      <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Observación inicial de patrones y reacciones
                      </span>
                    </div>
                  </label>
                  <label className={`relative flex cursor-pointer rounded-lg border p-4 ${
                    level === 'deep'
                      ? 'border-indigo-500 ring-2 ring-indigo-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      name="contemplation-level"
                      value="deep"
                      checked={level === 'deep'}
                      onChange={(e) => setLevel(e.target.value as 'superficial' | 'deep')}
                      className="sr-only"
                    />
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Profunda
                      </span>
                      <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Indagación profunda en la naturaleza del ser
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="insights" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Insights y Observaciones
                </label>
                <textarea
                  id="insights"
                  value={insights}
                  onChange={(e) => setInsights(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="¿Qué has descubierto durante la práctica?"
                />
              </div>

              <div>
                <label htmlFor="limiting-belief" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Creencia Limitante Identificada
                </label>
                <textarea
                  id="limiting-belief"
                  value={limitingBelief}
                  onChange={(e) => setLimitingBelief(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="¿Qué creencia limitante has identificado?"
                />
              </div>

              <div>
                <label htmlFor="new-perspective" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nueva Perspectiva
                </label>
                <textarea
                  id="new-perspective"
                  value={newPerspective}
                  onChange={(e) => setNewPerspective(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="¿Qué nueva perspectiva has descubierto?"
                />
              </div>
            </form>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 p-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="reflectionForm"
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors w-full sm:w-auto"
            >
              Guardar Reflexión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}