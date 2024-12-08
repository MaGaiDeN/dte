import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { TRANSFORMATION_SHORTCUTS } from '../types/Reflection';
import type { Practice } from '../types/Habit';
import { BookOpen, Brain, Flower2, AlertCircle, XIcon } from 'lucide-react';
import { formatDateToHuman } from '../utils/dateUtils';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  practiceId: string;
  practice: Practice;
  title?: string;
  onSave: (reflection: ReflectionFormData) => void;
  children?: React.ReactNode;
}

interface ReflectionFormData {
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
}

function ReflectionModalComponent({ isOpen, onClose, date, practiceId, practice, onSave, children, title }: ReflectionModalProps) {
  // Combinar estados relacionados en un solo objeto
  const [formData, setFormData] = useState<ReflectionFormData>({
    practiceId,
    date,
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
      level: 'superficial',
      insights: '',
      question: ''
    },
    transformation: {
      limitingBelief: '',
      newPerspective: '',
      doorMoment: undefined
    },
    practices: {
      breathingExercise: false,
      witnessPresence: false,
      mentalClearing: false,
      selfInquiry: false
    },
    isEmpty: true
  });

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      practiceId,
      date
    }));
  }, [date, practiceId]);

  const handlePracticeSelect = useCallback((type: string) => {
    const practiceMap: Record<string, keyof typeof formData.practices> = {
      breathing: 'breathingExercise',
      witness: 'witnessPresence',
      clearing: 'mentalClearing',
      inquiry: 'selfInquiry'
    };

    const key = practiceMap[type];
    if (key) {
      setFormData(prev => ({
        ...prev,
        practices: {
          ...prev.practices,
          [key]: !prev.practices[key]
        }
      }));
    }
  }, [formData]);

  const renderPracticeOption = useMemo(() => (
    type: 'breathing' | 'witness' | 'clearing' | 'inquiry',
    icon: React.ReactNode,
    stateKey: keyof typeof formData.practices
  ) => {
    const description = TRANSFORMATION_SHORTCUTS.find(s => s.type === type)?.description || '';
    const shortcut = TRANSFORMATION_SHORTCUTS.find(s => s.type === type);
    
    return (
      <label 
        key={type}
        className={`relative flex cursor-pointer rounded-lg border p-4 group ${
          formData.practices[stateKey] 
            ? 'border-indigo-500 ring-2 ring-indigo-500' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <input
          type="checkbox"
          checked={formData.practices[stateKey]}
          onChange={() => handlePracticeSelect(type)}
          className="sr-only"
        />
        <div className="flex flex-col">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            {icon}
            {shortcut?.name}
          </span>
          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </span>
        </div>
      </label>
    );
  }, [formData, handlePracticeSelect]);

  // Reemplazar console.log con una función de logging más controlada
  const logDebug = useCallback((message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[ReflectionModal] ${message}`, ...args);
    }
  }, []);

  const handleError = useCallback((error: Error | unknown) => {
    logDebug('Error:', error);
    // Aquí podrías agregar lógica adicional para manejar errores
  }, [logDebug]);

  // Resetear el formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData(prevData => ({
        ...prevData,
        practiceId,
        date,
        event: { description: '', emotionalResponse: '' },
        beliefs: { self: [], others: [], life: [] },
        contemplation: { level: 'superficial', insights: '', question: '' },
        transformation: { limitingBelief: '', newPerspective: '', doorMoment: undefined },
        practices: {
          breathingExercise: false,
          witnessPresence: false,
          mentalClearing: false,
          selfInquiry: false
        },
        isEmpty: true
      }));
    }
  }, [isOpen, practiceId, date, logDebug, handleError]);

  useEffect(() => {
    if (isOpen && date && practice) {
      try {
        const existingReflection = Object.entries(practice.reflections || {}).find(
          ([reflectionDate]) => new Date(reflectionDate).toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
        )?.[1];

        if (existingReflection) {
          logDebug('Found existing reflection:', existingReflection);
          const newFormData: ReflectionFormData = {
            practiceId,
            date,
            event: {
              description: existingReflection.event?.description || '',
              emotionalResponse: existingReflection.event?.emotionalResponse || ''
            },
            beliefs: {
              self: existingReflection.beliefs?.self || [],
              others: existingReflection.beliefs?.others || [],
              life: existingReflection.beliefs?.life || []
            },
            contemplation: {
              level: existingReflection.contemplation?.level || 'superficial',
              insights: existingReflection.contemplation?.insights || '',
              question: existingReflection.contemplation?.question || ''
            },
            transformation: {
              limitingBelief: existingReflection.transformation?.limitingBelief || '',
              newPerspective: existingReflection.transformation?.newPerspective || '',
              doorMoment: existingReflection.transformation?.doorMoment || undefined
            },
            practices: {
              breathingExercise: existingReflection.practices?.breathingExercise || false,
              witnessPresence: existingReflection.practices?.witnessPresence || false,
              mentalClearing: existingReflection.practices?.mentalClearing || false,
              selfInquiry: existingReflection.practices?.selfInquiry || false
            },
            isEmpty: false
          };
          setFormData(newFormData);
        } else {
          logDebug('No existing reflection found for date:', date);
          setFormData(prev => ({
            ...prev,
            isEmpty: true
          }));
        }
      } catch (error) {
        handleError(error);
      }
    }
  }, [isOpen, date, practice, practiceId, logDebug, handleError]);

  const handleInputChange = useCallback((field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  const formatDateToISO = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const handleSave = () => {
    logDebug('Starting handleSave with:', {
      date,
      practiceId,
      practice: JSON.stringify(practice),
      formData: JSON.stringify(formData)
    });
    
    // Validate and format date
    const isoDate = formatDateToISO(date);
    logDebug('Formatted ISO date:', isoDate);
    
    if (!isoDate || isNaN(new Date(isoDate).getTime())) {
      logDebug('Invalid date provided:', date);
      return;
    }

    // Validate required fields - check if at least one practice is selected or there's content
    const hasSelectedPractices = Object.values(formData.practices).some(p => p);
    const hasContent = Boolean(formData.event.description || formData.event.emotionalResponse || formData.contemplation.insights || formData.transformation.limitingBelief || formData.transformation.newPerspective);

    if (!hasSelectedPractices && !hasContent) {
      logDebug('Please select at least one practice or provide some reflection content');
      return;
    }

    // Create the reflection data
    const reflection = {
      practiceId: formData.practiceId,
      date: isoDate,
      event: {
        description: formData.event.description.trim(),
        emotionalResponse: formData.event.emotionalResponse.trim(),
      },
      beliefs: {
        self: formData.beliefs.self,
        others: formData.beliefs.others,
        life: formData.beliefs.life,
      },
      contemplation: {
        level: formData.contemplation.level,
        insights: formData.contemplation.insights.trim(),
        question: formData.contemplation.question,
      },
      transformation: {
        limitingBelief: formData.transformation.limitingBelief.trim(),
        newPerspective: formData.transformation.newPerspective.trim(),
        doorMoment: formData.transformation.doorMoment,
      },
      practices: formData.practices,
      isEmpty: !hasContent && !hasSelectedPractices,
    };

    logDebug('Created reflection:', JSON.stringify(reflection));

    // Don't save if the reflection is empty
    if (reflection.isEmpty) {
      onClose();
      return;
    }

    // Call onSave with the reflection data
    onSave(reflection);
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
        type="button"
        onClick={handleSave}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Guardar Reflexión
      </button>
    </div>
  );

  if (!isOpen) return null;

  const formattedDate = formatDateToHuman(date);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 p-4 sm:p-6 shadow">
          <div className="absolute right-4 top-4">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                {title || `Reflexión del ${formattedDate}`}
              </h3>
              <div className="mt-2">
                <form id="reflectionForm" onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prácticas Realizadas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderPracticeOption('breathing', <BookOpen className="h-6 w-6" />, 'breathingExercise')}
                      {renderPracticeOption('witness', <Brain className="h-6 w-6" />, 'witnessPresence')}
                      {renderPracticeOption('clearing', <Flower2 className="h-6 w-6" />, 'mentalClearing')}
                      {renderPracticeOption('inquiry', <AlertCircle className="h-6 w-6" />, 'selfInquiry')}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="event" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Evento o Situación
                    </label>
                    <textarea
                      id="event"
                      value={formData.event.description}
                      onChange={(e) => handleInputChange('event', { description: e.target.value, emotionalResponse: formData.event.emotionalResponse })}
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
                      value={formData.event.emotionalResponse}
                      onChange={(e) => handleInputChange('event', { description: formData.event.description, emotionalResponse: e.target.value })}
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
                        formData.contemplation.level === 'superficial'
                          ? 'border-indigo-500 ring-2 ring-indigo-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        <input
                          type="radio"
                          name="contemplation-level"
                          value="superficial"
                          checked={formData.contemplation.level === 'superficial'}
                          onChange={(e) => handleInputChange('contemplation', { level: e.target.value, insights: formData.contemplation.insights, question: formData.contemplation.question })}
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
                        formData.contemplation.level === 'deep'
                          ? 'border-indigo-500 ring-2 ring-indigo-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        <input
                          type="radio"
                          name="contemplation-level"
                          value="deep"
                          checked={formData.contemplation.level === 'deep'}
                          onChange={(e) => handleInputChange('contemplation', { level: e.target.value, insights: formData.contemplation.insights, question: formData.contemplation.question })}
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
                      value={formData.contemplation.insights}
                      onChange={(e) => handleInputChange('contemplation', { level: formData.contemplation.level, insights: e.target.value, question: formData.contemplation.question })}
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
                      value={formData.transformation.limitingBelief}
                      onChange={(e) => handleInputChange('transformation', { limitingBelief: e.target.value, newPerspective: formData.transformation.newPerspective, doorMoment: formData.transformation.doorMoment })}
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
                      value={formData.transformation.newPerspective}
                      onChange={(e) => handleInputChange('transformation', { limitingBelief: formData.transformation.limitingBelief, newPerspective: e.target.value, doorMoment: formData.transformation.doorMoment })}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="¿Qué nueva perspectiva has descubierto?"
                    />
                  </div>
                </form>
                {children}
                {modalFooter}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReflectionModalComponent.displayName = 'ReflectionModalComponent';

export const ReflectionModal = memo(ReflectionModalComponent);