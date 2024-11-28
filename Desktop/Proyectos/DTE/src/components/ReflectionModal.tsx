import { X, BookOpen, Brain, Flower2, AlertCircle, Eye, Wind } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LIMITING_BELIEFS, CONTEMPLATION_QUESTIONS, TRANSFORMATION_SHORTCUTS } from '../types/Reflection';

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
  const [eventDescription, setEventDescription] = useState('');
  const [emotionalResponse, setEmotionalResponse] = useState('');
  const [selectedBeliefs, setSelectedBeliefs] = useState({
    self: [] as string[],
    others: [] as string[],
    life: [] as string[]
  });
  const [contemplationLevel, setContemplationLevel] = useState<'superficial' | 'deep'>('superficial');
  const [contemplationQuestion, setContemplationQuestion] = useState('');
  const [contemplationInsights, setContemplationInsights] = useState('');
  const [limitingBelief, setLimitingBelief] = useState('');
  const [newPerspective, setNewPerspective] = useState('');
  const [doorMoment, setDoorMoment] = useState('');
  const [practices, setPractices] = useState({
    breathingExercise: false,
    witnessPresence: false,
    mentalClearing: false,
    selfInquiry: false
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setEventDescription('');
      setEmotionalResponse('');
      setSelectedBeliefs({ self: [], others: [], life: [] });
      setContemplationLevel('superficial');
      setContemplationQuestion('');
      setContemplationInsights('');
      setLimitingBelief('');
      setNewPerspective('');
      setDoorMoment('');
      setPractices({
        breathingExercise: false,
        witnessPresence: false,
        mentalClearing: false,
        selfInquiry: false
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasContent = (): boolean => {
    return !!(
      eventDescription.trim() ||
      emotionalResponse.trim() ||
      contemplationInsights.trim() ||
      limitingBelief.trim() ||
      newPerspective.trim() ||
      doorMoment.trim() ||
      practices.breathingExercise ||
      practices.witnessPresence ||
      practices.mentalClearing ||
      practices.selfInquiry ||
      selectedBeliefs.self.length > 0 ||
      selectedBeliefs.others.length > 0 ||
      selectedBeliefs.life.length > 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      practiceId,
      date,
      event: {
        description: eventDescription.trim(),
        emotionalResponse: emotionalResponse.trim()
      },
      beliefs: selectedBeliefs,
      contemplation: {
        level: contemplationLevel,
        insights: contemplationInsights.trim(),
        question: contemplationQuestion.trim()
      },
      transformation: {
        limitingBelief: limitingBelief.trim(),
        newPerspective: newPerspective.trim(),
        doorMoment: doorMoment.trim() || undefined
      },
      practices,
      isEmpty: !hasContent()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Reflexión del {new Date(date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Evento y Emociones
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción del Evento
                </label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="¿Qué sucedió?"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Respuesta Emocional
                </label>
                <textarea
                  value={emotionalResponse}
                  onChange={(e) => setEmotionalResponse(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  placeholder="¿Qué emociones surgieron?"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Contemplación
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nivel de Contemplación
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setContemplationLevel('superficial')}
                    className={`flex-1 p-3 rounded-lg border ${
                      contemplationLevel === 'superficial'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Superficial
                  </button>
                  <button
                    type="button"
                    onClick={() => setContemplationLevel('deep')}
                    className={`flex-1 p-3 rounded-lg border ${
                      contemplationLevel === 'deep'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Profunda
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Insights y Observaciones
                </label>
                <textarea
                  value={contemplationInsights}
                  onChange={(e) => setContemplationInsights(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="¿Qué has descubierto?"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Flower2 className="h-5 w-5 text-pink-600" />
                Transformación
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Creencia Limitante
                </label>
                <textarea
                  value={limitingBelief}
                  onChange={(e) => setLimitingBelief(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  placeholder="¿Qué creencia no te sirve?"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nueva Perspectiva
                </label>
                <textarea
                  value={newPerspective}
                  onChange={(e) => setNewPerspective(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  placeholder="¿Qué nueva perspectiva has encontrado?"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Prácticas Realizadas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {TRANSFORMATION_SHORTCUTS.map((shortcut) => (
                  <button
                    key={shortcut.type}
                    type="button"
                    onClick={() =>
                      setPractices((prev) => ({
                        ...prev,
                        [shortcut.type === 'breathing'
                          ? 'breathingExercise'
                          : shortcut.type === 'witness'
                          ? 'witnessPresence'
                          : shortcut.type === 'inquiry'
                          ? 'selfInquiry'
                          : 'mentalClearing']: !prev[
                          shortcut.type === 'breathing'
                            ? 'breathingExercise'
                            : shortcut.type === 'witness'
                            ? 'witnessPresence'
                            : shortcut.type === 'inquiry'
                            ? 'selfInquiry'
                            : 'mentalClearing'
                        ],
                      }))
                    }
                    className={`p-4 rounded-lg border text-left ${
                      practices[
                        shortcut.type === 'breathing'
                          ? 'breathingExercise'
                          : shortcut.type === 'witness'
                          ? 'witnessPresence'
                          : shortcut.type === 'inquiry'
                          ? 'selfInquiry'
                          : 'mentalClearing'
                      ]
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{shortcut.name}</div>
                    <div className="text-sm text-gray-500">{shortcut.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar Reflexión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}