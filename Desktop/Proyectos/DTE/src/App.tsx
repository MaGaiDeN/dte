import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { Practice } from './types/Habit';
import { AddHabitModal } from './components/AddHabitModal';
import { ReflectionModal } from './components/ReflectionModal';
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
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);

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
    const today = new Date().toISOString().split('T')[0];
    const resetPractices = DEFAULT_PRACTICES.map(practice => ({
      ...practice,
      startDate: today,
      completedDates: [],
      progress: 0,
      currentStreak: 0,
      longestStreak: 0
    }));
    setPractices(resetPractices);
    localStorage.setItem('practices', JSON.stringify(resetPractices));
  };

  const handleEditPractice = (practice: Practice) => {
    setEditingPractice(practice);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-light-primary dark:bg-gray-900 transition-colors duration-200">
      <Header onReset={handleReset} onNewPractice={() => {
        setEditingPractice(null);
        setIsAddModalOpen(true);
      }} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <PracticeStats practices={practices} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
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
              onEdit={handleEditPractice}
            />
          ))}
        </div>
      </main>

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
          const newPractices = [...practices, newPractice];
          setPractices(newPractices);
          localStorage.setItem('practices', JSON.stringify(newPractices));
        }}
        onEdit={(updatedPractice) => {
          const newPractices = practices.map((p) =>
            p.id === updatedPractice.id ? updatedPractice : p
          );
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

          const totalDays = practice.duration;
          const completedDays = practice.completedDates.length;
          practice.progress = (completedDays / totalDays) * 100;

          setPractices(newPractices);
          localStorage.setItem('practices', JSON.stringify(newPractices));
        }}
      />
    </div>
  );
}

export default App;