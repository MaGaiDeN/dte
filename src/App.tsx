import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Practice } from './types/Habit';
import { AddHabitModal } from './components/AddHabitModal';
import { ReflectionModal } from './components/ReflectionModal';
import { StatsModal } from './components/StatsModal';
import { PracticeCard } from './components/PracticeCard';
import { Header } from './components/Header';
import { ChallengesList } from './components/ChallengesList';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { resetPractices, deletePractice, addPractice, updatePractice } from './store/practicesSlice';
import { staggerChildren } from './constants/animations';
import chroma from 'chroma-js';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { MeditationChallengeForm } from './components/MeditationChallengeForm';

function App() {
  const practices = useAppSelector(state => state.practices.items);
  const dispatch = useAppDispatch();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPracticeId, setSelectedPracticeId] = useState('');
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [isMeditationChallengeOpen, setIsMeditationChallengeOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);

  const handleReset = () => {
    dispatch(resetPractices());
  };

  const handleCreateChallenge = (type: 'meditation' | 'inquiry' | 'contemplation') => {
    const newChallenge: Practice = {
      id: crypto.randomUUID(),
      type,
      name: `Reto de 30 días de ${type === 'meditation' ? 'Meditación' : type === 'inquiry' ? 'Autoindagación' : 'Contemplación'}`,
      description: `Reto de 30 días de ${type === 'meditation' ? 'meditación' : type === 'inquiry' ? 'autoindagación' : 'contemplación'} para desarrollar el hábito de la práctica diaria`,
      duration: 30,
      startDate: new Date().toISOString().split('T')[0],
      progress: 0,
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0,
      color: chroma.random().hex(),
      reflections: {}
    };
    console.log('Creating new challenge:', newChallenge);
    dispatch(addPractice(newChallenge));
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

    const updatedPractice = { 
      ...practice,
      reflections: {
        ...practice.reflections,
        [reflection.date]: reflection
      }
    };
    
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
    <ThemeProvider>
      <ConfigProvider>
        <div className="min-h-screen bg-light-primary dark:bg-gray-900 transition-colors duration-200">
          <Header 
            onReset={handleReset} 
            onNewPractice={() => {
              setEditingPractice(null);
              setIsAddModalOpen(true);
            }}
            onShowStats={() => setIsStatsModalOpen(true)}
            onCreateChallenge={handleCreateChallenge}
          />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* Challenges Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Retos</h2>
              <ChallengesList />
            </section>

            {/* Practices Grid */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Prácticas</h2>
              <motion.div 
                variants={staggerChildren}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 gap-4 sm:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {practices.map((practice) => (
                    <PracticeCard
                      key={practice.id}
                      practice={practice}
                      onDelete={(id) => {
                        dispatch(deletePractice(id));
                      }}
                      onClick={(practiceId, date) => {
                        const practice = practices.find(p => p.id === practiceId);
                        if (practice?.type === 'meditation' && practice.duration === 30) {
                          setSelectedPracticeId(practiceId);
                          setSelectedDate(date);
                          setIsMeditationChallengeOpen(true);
                        } else {
                          setSelectedPracticeId(practiceId);
                          setSelectedDate(date);
                          setIsReflectionModalOpen(true);
                        }
                      }}
                      onEdit={handleEditPractice}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </section>
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
                    startDate: new Date().toISOString().split('T')[0],
                    reflections: {}  // Initialize empty reflections
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
                practice={practices.find(p => p.id === selectedPracticeId) as Practice}
                updatePractice={(updatedPractice: Practice) => dispatch(updatePractice(updatedPractice))}
                onSave={handleSaveReflection}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isMeditationChallengeOpen && selectedPracticeId && selectedDate && (
              <MeditationChallengeForm
                onSaveReflection={(reflection) => {
                  handleSaveReflection({
                    ...reflection,
                    practiceId: selectedPracticeId,
                    date: selectedDate,
                  });
                }}
                dayNumber={(() => {
                  const practice = practices.find(p => p.id === selectedPracticeId);
                  if (!practice) return 1;
                  const startDate = new Date(practice.startDate);
                  const selectedDateObj = new Date(selectedDate);
                  const diffTime = Math.abs(selectedDateObj.getTime() - startDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays;
                })()}
                onClose={() => setIsMeditationChallengeOpen(false)}
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
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;