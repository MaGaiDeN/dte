import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Practice } from './types/Habit';
import { AddHabitModal } from './components/AddHabitModal';
import { ReflectionModal } from './components/ReflectionModal';
import { StatsModal } from './components/StatsModal';
import { PracticeCard } from './components/PracticeCard';
import { Header } from './components/Header';
import { NotificationSettings } from './components/NotificationSettings';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { resetPractices, deletePractice, addPractice, updatePractice } from './store/practicesSlice';
import { staggerChildren } from './constants/animations';
import chroma from 'chroma-js';

function App() {
  const practices = useAppSelector(state => state.practices.items);
  const dispatch = useAppDispatch();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPracticeId, setSelectedPracticeId] = useState('');
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);

  const handleReset = () => {
    dispatch(resetPractices());
  };

  const handleEditPractice = (practice: Practice) => {
    setEditingPractice(practice);
    setIsAddModalOpen(true);
  };

  const handleSaveReflection = useCallback((reflection: {
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
  }) => {
    const practice = practices.find((p) => p.id === reflection.practiceId);
    if (!practice) return;

    const updatedPractice = { ...practice };
    
    if (!reflection.isEmpty) {
      if (!updatedPractice.completedDates.includes(reflection.date)) {
        updatedPractice.completedDates = [...updatedPractice.completedDates, reflection.date].sort();
      }
    } else {
      updatedPractice.completedDates = updatedPractice.completedDates.filter(
        (date) => date !== reflection.date
      );
    }

    const totalDays = updatedPractice.duration;
    const completedDays = updatedPractice.completedDates.length;
    updatedPractice.progress = (completedDays / totalDays) * 100;

    dispatch(updatePractice(updatedPractice));
  }, [practices, dispatch]);

  return (
    <div className="min-h-screen bg-light-primary dark:bg-gray-900 transition-colors duration-200">
      <Header 
        onReset={handleReset} 
        onNewPractice={() => {
          setEditingPractice(null);
          setIsAddModalOpen(true);
        }}
        onShowStats={() => setIsStatsModalOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6">
          <NotificationSettings />
        </motion.div>

        <motion.div 
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {practices.map((practice) => (
              <PracticeCard
                key={practice.id}
                practice={practice}
                onDelete={(id) => {
                  dispatch(deletePractice(id));
                }}
                onClick={(practiceId, date) => {
                  setSelectedPracticeId(practiceId);
                  setSelectedDate(date);
                  setIsReflectionModalOpen(true);
                }}
                onEdit={handleEditPractice}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddHabitModal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingPractice(null);
            }}
            editPractice={editingPractice}
            onAdd={(form) => {
              const newPractice: Practice = {
                id: crypto.randomUUID(),
                type: form.type,
                name: form.name,
                description: form.description,
                color: chroma.random().hex(),
                progress: 0,
                completedDates: [],
                currentStreak: 0,
                longestStreak: 0,
                duration: form.duration,
                startDate: new Date().toISOString().split('T')[0]
              };
              dispatch(addPractice(newPractice));
            }}
            onEdit={(updatedPractice) => {
              dispatch(updatePractice(updatedPractice));
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReflectionModalOpen && (
          <ReflectionModal
            isOpen={isReflectionModalOpen}
            onClose={() => setIsReflectionModalOpen(false)}
            date={selectedDate}
            practiceId={selectedPracticeId}
            practice={practices.find(p => p.id === selectedPracticeId)}
            updatePractice={(updatedPractice) => dispatch(updatePractice(updatedPractice))}
            onSave={handleSaveReflection}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStatsModalOpen && (
          <StatsModal
            isOpen={isStatsModalOpen}
            onClose={() => setIsStatsModalOpen(false)}
            practices={practices}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;