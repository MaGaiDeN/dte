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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full"
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{challenge.title}</h3>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">{challenge.days} días</span>
          </div>
        </div>
        
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">{challenge.description}</p>
        
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {days.map((day) => (
            <button
              key={day.day}
              onClick={() => handleDayClick(day.day)}
              className={`
                p-2 rounded-lg text-sm sm:text-base
                ${day.isCompleted
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
                flex items-center justify-center
                transition-colors duration-200
              `}
            >
              {day.isCompleted ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                day.day
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedDay && (
        <ReflectionModal
          isOpen={selectedDay !== null}
          onClose={() => setSelectedDay(null)}
          date={new Date().toISOString()}
          practiceId={challenge.id}
          practice={challenge as any}
          onSave={handleSaveReflection}
        />
      )}
    </motion.div>
  );
};
