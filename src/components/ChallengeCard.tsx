import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle } from 'lucide-react';
import type { Challenge, ChallengeDay } from '../types/Challenge';
import { ReflectionModal } from './ReflectionModal';
import { MeditationChallengeForm } from './MeditationChallengeForm';
import { ContemplationChallengeForm } from './ContemplationChallengeForm';
import chroma from 'chroma-js';
import { formatDate } from '../utils/dateUtils';

interface ChallengeCardProps {
  challenge: Challenge;
  onUpdateProgress: (progress: number | null) => void;
}

export const ChallengeCard = ({ challenge, onUpdateProgress }: ChallengeCardProps) => {
  console.log('ChallengeCard renderizado:', {
    challenge,
    startDate: challenge.startDate,
    currentTime: new Date().toISOString(),
    horaLocal: new Date().getHours()
  });

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [days, setDays] = useState<ChallengeDay[]>(() => {
    const today = new Date();
    const todayStr = formatDate(today);
    
    // Initialize days based on some logic without referencing 'days'
    const initialDays: ChallengeDay[] = Array.from({ length: 30 }, (_, i) => {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dateStr = formatDate(currentDate);
      const dayNumber = i + 1;
      
      return {
        day: dayNumber,
        isCompleted: false,
        isClickable: true,
        date: dateStr
      };
    });

    console.log('=== Inicialización de días ===');
    console.log('Fecha actual:', {
      fecha: todayStr,
      objetoFecha: today.toISOString(),
    });
    return initialDays;
  });

  const handleDayClick = (day: number) => {
    const selectedDayData = days.find(d => d.day === day);
    console.log('Click en día:', {
      numeroDia: day,
      diaEncontrado: selectedDayData,
      esClickeable: selectedDayData?.isClickable,
      fecha: selectedDayData?.date,
      todosLosDias: days.map(d => ({
        dia: d.day,
        clickeable: d.isClickable,
        fecha: d.date
      })),
      horaLocal: new Date().getHours()
    });
    
    if (selectedDayData && selectedDayData.isClickable) {
      setSelectedDay(day);
    }
  };

  const handleSaveReflection = (reflection: any) => {
    if (selectedDay !== null) {
      const newDays = [...days];
      const dayIndex = selectedDay - 1;
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        isCompleted: true,
        reflection
      };
      setDays(newDays);

      const completedDays = newDays.filter(day => day.isCompleted).length;
      const progress = (completedDays / 30) * 100;
      onUpdateProgress(progress !== null ? progress : 0);
    }
    setSelectedDay(null);
  };

  const getChallengeForm = () => {
    if (!selectedDay) return null;

    switch (challenge.type) {
      case 'meditation':
        return (
          <MeditationChallengeForm
            onSaveReflection={handleSaveReflection}
            dayNumber={selectedDay}
            onClose={() => setSelectedDay(null)}
          />
        );
      case 'contemplation':
        return (
          <ContemplationChallengeForm
            onSaveReflection={handleSaveReflection}
            dayNumber={selectedDay}
            onClose={() => setSelectedDay(null)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {challenge.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {challenge.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {days.filter(day => day.isCompleted).length} / {challenge.days} días
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-6 gap-2">
          {days.map((day) => (
            <button
              key={day.day}
              onClick={() => handleDayClick(day.day)}
              disabled={!day.isClickable}
              className={`
                relative p-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${day.isCompleted
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : day.isClickable
                    ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-300 dark:text-gray-500 opacity-50'
                }
                ${!day.isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {day.day}
              {day.isCompleted && (
                <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedDay && (
        <ReflectionModal
          isOpen={selectedDay !== null}
          onClose={() => {
            console.log('Modal closing');
            setSelectedDay(null);
          }}
          title={`Día ${selectedDay} - ${challenge.title}`}
          date={new Date().toISOString()}
          practiceId={challenge.id}
          practice={{
            id: challenge.id,
            type: challenge.type,
            name: challenge.name,
            description: challenge.description,
            color: chroma.random().hex(),
            startDate: new Date().toISOString(),
            endDate: null,
            frequency: null,
            progress: 0,
            status: 'active',
            completedDates: [],
            duration: 30,
            reflections: {},
            currentStreak: 0,
            longestStreak: 0
          }}
          updatePractice={(updatedPractice) => {
            console.log('Updating practice:', updatedPractice);
          }}
          onSave={(reflection) => {
            console.log('Saving reflection:', reflection);
            handleSaveReflection(reflection);
          }}
        >
          {getChallengeForm()}
        </ReflectionModal>
      )}
    </motion.div>
  );
};
