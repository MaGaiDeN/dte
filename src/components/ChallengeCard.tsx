import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle } from 'lucide-react';
import type { Challenge, ChallengeDay } from '../types/Challenge';
import { ReflectionModal } from './ReflectionModal';

interface ChallengeCardProps {
  challenge: Challenge;
  onUpdateProgress: (progress: number) => void;
}

export const ChallengeCard = ({ challenge, onUpdateProgress }: ChallengeCardProps) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [days, setDays] = useState<ChallengeDay[]>(
    Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      isCompleted: false
    }))
  );

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const handleSaveReflection = (reflection: any) => {
    const updatedDays = [...days];
    const dayIndex = days.findIndex(d => d.day === selectedDay);
    if (dayIndex !== -1) {
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        isCompleted: true,
        reflection,
        date: new Date().toISOString()
      };
      setDays(updatedDays);
      
      const progress = (updatedDays.filter(d => d.isCompleted).length / 30) * 100;
      onUpdateProgress(progress);
    }
    setSelectedDay(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {challenge.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {challenge.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {challenge.startDate ? new Date(challenge.startDate).toLocaleDateString() : 'No iniciado'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {days.map((day) => (
          <motion.button
            key={day.day}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDayClick(day.day)}
            className={`aspect-square rounded-lg flex items-center justify-center relative ${
              day.isCompleted
                ? 'bg-green-100 dark:bg-green-900'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {day.day}
            </span>
            {day.isCompleted && (
              <CheckCircle className="w-4 h-4 text-green-500 absolute top-1 right-1" />
            )}
          </motion.button>
        ))}
      </div>

      {selectedDay !== null && (
        <ReflectionModal
          isOpen={true}
          onClose={() => setSelectedDay(null)}
          date={new Date().toISOString()}
          practiceId={challenge.id}
          practice={{
            id: challenge.id,
            type: challenge.type,
            name: `Día ${selectedDay}`,
            description: '',
            isCompleted: false,
            color: 'blue',
            progress: 0,
            completedDates: [],
            reflections: {},
            currentStreak: 0,
            longestStreak: 0,
            duration: 30,
            startDate: new Date().toISOString(),
          }}
          updatePractice={() => {}}
          onSave={handleSaveReflection}
        />
      )}
    </div>
  );
};
