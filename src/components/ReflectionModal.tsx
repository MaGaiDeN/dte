import { useMemo } from 'react';
import { useState, useEffect, useCallback, memo } from 'react';
import { TRANSFORMATION_SHORTCUTS } from '../types/Reflection';
import type { Practice } from '../types/Habit';
import { Modal } from './shared/Modal';
import { BookOpen, Brain, Flower2, AlertCircle } from 'lucide-react';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  practiceId: string;
  practice: Practice;
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

export const ReflectionModal = memo(({ isOpen, onClose, date, practiceId, practice, onSave }: ReflectionModalProps) => {
  // Combinar estados relacionados en un solo objeto
  const [formData, setFormData] = useState({
    practiceId,  // Agregamos practiceId al estado
    event: '',
    emotionalResponse: '',
    insights: '',
    level: 'superficial' as 'superficial' | 'deep',
    limitingBelief: '',
    newPerspective: '',
    practices: {
      breathingExercise: false,
      witnessPresence: false,
      mentalClearing: false,
      selfInquiry: false,
    }
  });

  // Cache de la descripción de prácticas
  const practiceDescriptions = useMemo(() => ({
    breathing: TRANSFORMATION_SHORTCUTS.find(s => s.type === 'breathing')?.description || '',
    witness: TRANSFORMATION_SHORTCUTS.find(s => s.type === 'witness')?.description || '',
    clearing: TRANSFORMATION_SHORTCUTS.find(s => s.type === 'clearing')?.description || '',
    inquiry: TRANSFORMATION_SHORTCUTS.find(s => s.type === 'inquiry')?.description || ''
  }), []);

  // Resetear el formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        practiceId,  // Mantenemos el practiceId al resetear
        event: '',
        emotionalResponse: '',
        insights: '',
        level: 'superficial',
        limitingBelief: '',
        newPerspective: '',
        practices: {
          breathingExercise: false,
          witnessPresence: false,
          mentalClearing: false,
          selfInquiry: false,
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && date && practice) {
      console.log('Modal opened with:', {
        date,
        practiceId,
        practice: JSON.stringify(practice),
        reflections: JSON.stringify(practice.reflections || {})
      });

      // Ensure reflections object exists
      const reflections = practice.reflections || {};
      
      // Buscar si ya existe una reflexión para esta fecha
      const existingReflection = reflections[date];

      if (existingReflection) {
        console.log('Loading existing reflection:', existingReflection);
        // Si existe, cargar los datos guardados
        setFormData({
          practiceId,
          event: existingReflection.event.description || '',
          emotionalResponse: existingReflection.event.emotionalResponse || '',
          insights: existingReflection.contemplation.insights || '',
          level: existingReflection.contemplation.level || 'superficial',
          limitingBelief: existingReflection.transformation.limitingBelief || '',
          newPerspective: existingReflection.transformation.newPerspective || '',
          practices: existingReflection.practices || {
            breathingExercise: false,
            witnessPresence: false,
            mentalClearing: false,
            selfInquiry: false,
          }
        });
      } else {
        console.log('No existing reflection found for date:', date);
        console.log('Current reflections object:', reflections);
        // Si no existe, resetear el formulario
        setFormData({
          practiceId,
          event: '',
          emotionalResponse: '',
          insights: '',
          level: 'superficial',
          limitingBelief: '',
          newPerspective: '',
          practices: {
            breathingExercise: false,
            witnessPresence: false,
            mentalClearing: false,
            selfInquiry: false,
          }
        });
      }
    }
  }, [isOpen, date, practice, practiceId]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handlePracticeSelect = useCallback((type: 'breathing' | 'witness' | 'inquiry' | 'clearing') => {
    setFormData(prev => {
      const practiceMap = {
        breathing: 'breathingExercise',
        witness: 'witnessPresence',
        inquiry: 'selfInquiry',
        clearing: 'mentalClearing'
      } as const;
      
      const practiceKey = practiceMap[type];
      return {
        ...prev,
        practices: {
          ...prev.practices,
          [practiceKey]: !prev.practices[practiceKey]
        }
      };
    });
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
    console.log('Starting handleSave with:', {
      date,
      practiceId,
      practice: JSON.stringify(practice),
      formData: JSON.stringify(formData)
    });
    
    // Validate and format date
    const isoDate = formatDateToISO(date);
    console.log('Formatted ISO date:', isoDate);
    
    if (!isoDate || isNaN(new Date(isoDate).getTime())) {
      console.error('Invalid date provided:', date);
      return;
    }

    // Validate required fields - check if at least one practice is selected or there's content
    const hasSelectedPractices = Object.values(formData.practices).some(p => p);
    const hasContent = Boolean(formData.event || formData.emotionalResponse || formData.insights || formData.limitingBelief || formData.newPerspective);

    if (!hasSelectedPractices && !hasContent) {
      console.warn('Please select at least one practice or provide some reflection content');
      return;
    }

    // Create the reflection data
    const reflection = {
      practiceId: formData.practiceId,
      date: isoDate,
      event: {
        description: formData.event.trim(),
        emotionalResponse: formData.emotionalResponse.trim(),
      },
      beliefs: {
        self: [],
        others: [],
        life: [],
      },
      contemplation: {
        level: formData.level,
        insights: formData.insights.trim(),
        question: '',
      },
      transformation: {
        limitingBelief: formData.limitingBelief.trim(),
        newPerspective: formData.newPerspective.trim(),
      },
      practices: formData.practices,
      isEmpty: !hasContent && !hasSelectedPractices,
    };

    console.log('Created reflection:', JSON.stringify(reflection));

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

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getPracticeDescription = useCallback((type: 'breathing' | 'witness' | 'clearing' | 'inquiry') => {
    return practiceDescriptions[type];
  }, [practiceDescriptions]);

  const renderPracticeOption = useCallback((
    type: 'breathing' | 'witness' | 'clearing' | 'inquiry',
    icon: React.ReactNode,
    stateKey: keyof typeof formData.practices
  ) => {
    const description = getPracticeDescription(type);
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
  }, [formData.practices, handlePracticeSelect, getPracticeDescription]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reflexión del ${formattedDate}`}
      footer={modalFooter}
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 p-4 sm:p-6 shadow">
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
              value={formData.event}
              onChange={(e) => handleInputChange('event', e.target.value)}
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
              value={formData.emotionalResponse}
              onChange={(e) => handleInputChange('emotionalResponse', e.target.value)}
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
                formData.level === 'superficial'
                  ? 'border-indigo-500 ring-2 ring-indigo-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                <input
                  type="radio"
                  name="contemplation-level"
                  value="superficial"
                  checked={formData.level === 'superficial'}
                  onChange={(e) => handleInputChange('level', e.target.value)}
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
                formData.level === 'deep'
                  ? 'border-indigo-500 ring-2 ring-indigo-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                <input
                  type="radio"
                  name="contemplation-level"
                  value="deep"
                  checked={formData.level === 'deep'}
                  onChange={(e) => handleInputChange('level', e.target.value)}
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
              value={formData.insights}
              onChange={(e) => handleInputChange('insights', e.target.value)}
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
              value={formData.limitingBelief}
              onChange={(e) => handleInputChange('limitingBelief', e.target.value)}
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
              value={formData.newPerspective}
              onChange={(e) => handleInputChange('newPerspective', e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="¿Qué nueva perspectiva has descubierto?"
            />
          </div>
        </form>
      </div>
    </Modal>
  );
});