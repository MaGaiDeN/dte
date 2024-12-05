import { motion } from 'framer-motion';
import { X, BookOpen, Brain, Flower2, AlertCircle } from 'lucide-react';
import { useState, useEffect, useCallback, memo } from 'react';
import { TRANSFORMATION_SHORTCUTS } from '../types/Reflection';

// Función auxiliar para obtener el día actual basado en la hora local
const getCurrentDay = () => {
  const now = new Date();
  // Si es antes de las 00:00, retornamos el día anterior
  if (now.getHours() < 0) {
    now.setDate(now.getDate() - 1);
  }
  return now.toISOString().split('T')[0];
};

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

export const ReflectionModal = memo(({ isOpen, onClose, date, practiceId, onSave }: ReflectionModalProps) => {
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
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEvent('');
      setEmotionalResponse('');
      setInsights('');
      setLevel('superficial');
      setLimitingBelief('');
      setNewPerspective('');
      setPractices({
        breathingExercise: false,
        witnessPresence: false,
        mentalClearing: false,
        selfInquiry: false,
      });
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const isEmpty = !event && !emotionalResponse && !insights && !limitingBelief && !newPerspective &&
      !Object.values(practices).some(Boolean);

    // Verificar si el día es válido para editar
    const currentDay = getCurrentDay();
    const selectedDate = new Date(date).toISOString().split('T')[0];
    
    if (selectedDate > currentDay) {
      alert('No puedes editar días futuros');
      return;
    }

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

    setHasChanges(false);
  }, [event, emotionalResponse, insights, limitingBelief, newPerspective, practices, practiceId, date, level, onSave]);

  const handlePracticeSelect = useCallback((type: 'breathing' | 'witness' | 'inquiry' | 'clearing') => {
    setPractices(prev => {
      const newPractices = {
        ...prev,
        breathingExercise: type === 'breathing' ? !prev.breathingExercise : prev.breathingExercise,
        witnessPresence: type === 'witness' ? !prev.witnessPresence : prev.witnessPresence,
        selfInquiry: type === 'inquiry' ? !prev.selfInquiry : prev.selfInquiry,
        mentalClearing: type === 'clearing' ? !prev.mentalClearing : prev.mentalClearing,
      };
      setHasChanges(true);
      return newPractices;
    });
  }, []);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      if (window.confirm('¿Estás seguro de que quieres cerrar? Hay cambios sin guardar.')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  if (!isOpen) return null;

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70"
        onClick={handleClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl flex flex-col my-6"
        >
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 p-6">
            <motion.h2
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-xl font-semibold text-gray-900 dark:text-gray-100"
            >
              Reflexión del {formattedDate}
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors rounded-lg p-1"
            >
              <X className="h-6 w-6" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[calc(85vh-8rem)]">
            <form id="reflectionForm" onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Prácticas Realizadas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPractices(prev => ({
                      ...prev,
                      breathingExercise: !prev.breathingExercise
                    }))}
                    className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                      practices.breathingExercise
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="text-center">
                      <BookOpen className={`h-6 w-6 mx-auto mb-2 ${
                        practices.breathingExercise
                          ? 'text-indigo-500'
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        practices.breathingExercise
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        Ejercicios de Respiración
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPractices(prev => ({
                      ...prev,
                      witnessPresence: !prev.witnessPresence
                    }))}
                    className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                      practices.witnessPresence
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="text-center">
                      <Brain className={`h-6 w-6 mx-auto mb-2 ${
                        practices.witnessPresence
                          ? 'text-indigo-500'
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        practices.witnessPresence
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        Presencia Testigo
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPractices(prev => ({
                      ...prev,
                      mentalClearing: !prev.mentalClearing
                    }))}
                    className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                      practices.mentalClearing
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="text-center">
                      <Flower2 className={`h-6 w-6 mx-auto mb-2 ${
                        practices.mentalClearing
                          ? 'text-indigo-500'
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        practices.mentalClearing
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        Limpieza Mental
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPractices(prev => ({
                      ...prev,
                      selfInquiry: !prev.selfInquiry
                    }))}
                    className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                      practices.selfInquiry
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="text-center">
                      <AlertCircle className={`h-6 w-6 mx-auto mb-2 ${
                        practices.selfInquiry
                          ? 'text-indigo-500'
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        practices.selfInquiry
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        Auto-indagación
                      </span>
                    </div>
                  </button>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
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
                <label htmlFor="insights" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
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
                <label htmlFor="limiting-belief" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
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
                <label htmlFor="new-perspective" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Flower2 className="h-4 w-4" />
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

          <div className="border-t border-gray-100 dark:border-gray-700 p-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="reflectionForm"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={!hasChanges}
            >
              Guardar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
});