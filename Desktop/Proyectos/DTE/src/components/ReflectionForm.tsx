import { useState } from 'react';
import type { Reflection } from '../types';

interface ReflectionFormProps {
  onSaveReflection: (reflection: Omit<Reflection, 'id' | 'date'>) => void;
}

export function ReflectionForm({ onSaveReflection }: ReflectionFormProps) {
  const [events, setEvents] = useState('');
  const [emotions, setEmotions] = useState('');
  const [deepObservation, setDeepObservation] = useState('');
  const [limitingBeliefs, setLimitingBeliefs] = useState('');
  const [transformation, setTransformation] = useState('');
  const [contemplationLevel, setContemplationLevel] = useState<'superficial' | 'deep'>('superficial');
  const [mindfulnessPractices, setMindfulnessPractices] = useState({
    breathingExercises: false,
    witnessPresence: false,
    mentalClearing: false,
    selfInquiry: false,
  });
  const [beliefs, setBeliefs] = useState({
    self: [] as string[],
    others: [] as string[],
    life: [] as string[],
  });
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!events && !emotions && !deepObservation) {
      console.warn('Please fill at least one reflection field');
      return;
    }

    const reflection = {
      event: {
        description: events,
        emotionalResponse: emotions
      },
      beliefs: {
        self: beliefs.self,
        others: beliefs.others,
        life: beliefs.life
      },
      contemplation: {
        level: contemplationLevel,
        insights: deepObservation,
        question: question
      },
      transformation: {
        limitingBelief: limitingBeliefs,
        newPerspective: transformation
      },
      practices: {
        breathingExercise: mindfulnessPractices.breathingExercises,
        witnessPresence: mindfulnessPractices.witnessPresence,
        mentalClearing: mindfulnessPractices.mentalClearing,
        selfInquiry: mindfulnessPractices.selfInquiry
      },
      isEmpty: !events && !emotions && !deepObservation, // Added the isEmpty property
    };

    // Call onSaveReflection and wait for confirmation
    try {
      onSaveReflection(reflection);
      
      // Reset form after successful save
      setEvents('');
      setEmotions('');
      setDeepObservation('');
      setLimitingBeliefs('');
      setTransformation('');
      setContemplationLevel('superficial');
      setMindfulnessPractices({
        breathingExercises: false,
        witnessPresence: false,
        mentalClearing: false,
        selfInquiry: false,
      });
      setBeliefs({
        self: [],
        others: [],
        life: [],
      });
      setQuestion('');
    } catch (error) {
      console.error('Failed to save reflection:', error);
    }
  };

  // Rest of the component remains the same...
  return (
    <form onSubmit={handleSubmit}>
      <div>Existing JSX</div>
    </form>
  );
}