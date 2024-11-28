import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { Practice } from './types/Habit';
import { AddHabitModal } from './components/AddHabitModal';
import { ReflectionModal } from './components/ReflectionModal';
import { PracticeLegend } from './components/PracticeLegend';
import { PracticeStats } from './components/PracticeStats';
import { PracticeCard } from './components/PracticeCard';
import { Header } from './components/Header';
import { DEFAULT_PRACTICES } from './constants/defaultPractices';
import chroma from 'chroma-js';

function App() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPracticeId, setSelectedPracticeId] = useState('');
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);

  useEffect(() => {
    const savedPractices = localStorage.getItem('practices');
    if (savedPractices) {
      setPractices(JSON.parse(savedPractices));
    } else {
      setPractices(DEFAULT_PRACTICES);
      localStorage.setItem('practices', JSON.stringify(DEFAULT_PRACTICES));
    }
  }, []);

  const handleReset = () => {
    // Update the start date to current date for all default practices
    const resetPractices = DEFAULT_PRACTICES.map(practice => ({
      ...practice,
      startDate: new Date().toISOString().split('T')[0]
    }));
    setPractices(resetPractices);
    localStorage.setItem('practices', JSON.stringify(resetPractices));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onReset={handleReset} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <PracticeStats practices={practices} />
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Prácticas Contemplativas
            </h2>
            <PracticeLegend />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Práctica
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {practices.map((practice) => (
            <PracticeCard
              key={practice.id}
              practice={practice}
              onDelete={(id) => {
                const newPractices = practices.filter((p) => p.id !== id);
                setPractices(newPractices);
                localStorage.setItem('practices', JSON.stringify(newPractices));
              }}
              onClick={(practiceId, date) => {
                setSelectedPracticeId(practiceId);
                setSelectedDate(date);
                setIsReflectionModalOpen(true);
              }}
              onEdit={(practice) => {
                const newPractices = practices.map((p) =>
                  p.id === practice.id ? practice : p
                );
                setPractices(newPractices);
                localStorage.setItem('practices', JSON.stringify(newPractices));
              }}
            />
          ))}
        </div>
      </main>

      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
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
          const newPractices = [...practices, newPractice];
          setPractices(newPractices);
          localStorage.setItem('practices', JSON.stringify(newPractices));
        }}
      />

      <ReflectionModal
        isOpen={isReflectionModalOpen}
        onClose={() => setIsReflectionModalOpen(false)}
        date={selectedDate}
        practiceId={selectedPracticeId}
        onSave={(reflection) => {
          const practiceIndex = practices.findIndex((p) => p.id === reflection.practiceId);
          if (practiceIndex === -1) return;

          const newPractices = [...practices];
          const practice = newPractices[practiceIndex];

          if (!reflection.isEmpty) {
            if (!practice.completedDates.includes(reflection.date)) {
              practice.completedDates.push(reflection.date);
              practice.completedDates.sort();
            }
          } else {
            practice.completedDates = practice.completedDates.filter(
              (date) => date !== reflection.date
            );
          }

          // Calculate progress
          const totalDays = practice.duration;
          const completedDays = practice.completedDates.length;
          practice.progress = (completedDays / totalDays) * 100;

          // Calculate streaks
          let currentStreak = 0;
          let longestStreak = practice.longestStreak;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          for (let i = practice.completedDates.length - 1; i >= 0; i--) {
            const currentDate = new Date(practice.completedDates[i]);
            const previousDate = i > 0 ? new Date(practice.completedDates[i - 1]) : null;

            if (previousDate) {
              const diffDays = Math.floor(
                (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              if (diffDays === 1) {
                currentStreak++;
              } else {
                break;
              }
            }
          }

          practice.currentStreak = currentStreak;
          practice.longestStreak = Math.max(longestStreak, currentStreak);

          setPractices(newPractices);
          localStorage.setItem('practices', JSON.stringify(newPractices));
        }}
      />
    </div>
  );
}

export default App;