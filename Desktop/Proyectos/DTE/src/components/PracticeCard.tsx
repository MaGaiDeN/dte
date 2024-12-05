import { motion } from 'framer-motion';
import { Trash2, Settings } from 'lucide-react';
import type { Practice } from '../types/Habit';
import { fadeIn, progressBarVariants } from '../constants/animations';
import * as Progress from '@radix-ui/react-progress';
import { forwardRef } from 'react';

interface PracticeCardProps {
  practice: Practice;
  onDelete: (id: string) => void;
  onClick: (practiceId: string, date: string) => void;
  onEdit: (practice: Practice) => void;
}

export const PracticeCard = forwardRef<HTMLDivElement, PracticeCardProps>(({ practice, onDelete, onClick, onEdit }, ref) => {
  const getDates = () => {
    // Generate an array of dates based on the startDate and duration
    const dates: string[] = [];
    const startDate = new Date(practice.startDate);
    
    for (let i = 0; i < practice.duration; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const isDateCompleted = (date: string) => {
    if (!practice.completedDates) return false;
    return Array.isArray(practice.completedDates) 
      ? practice.completedDates.includes(date)
      : Object.keys(practice.completedDates).includes(date);
  };

  const isDateClickable = (dateStr: string, index: number) => {
    // Obtener la fecha actual (considerando que un día termina a las 4 AM del día siguiente)
    const now = new Date();
    if (now.getHours() < 4) {
      now.setDate(now.getDate() - 1);
    }
    now.setHours(0, 0, 0, 0);

    // Verificar si la fecha del botón es futura
    const buttonDate = new Date(dateStr);
    buttonDate.setHours(0, 0, 0, 0);
    if (buttonDate > now) {
      return false;
    }

    // Si es un día completado, permitir editarlo
    if (isDateCompleted(dateStr)) {
      return true;
    }

    // Si no hay fechas completadas, solo permitir el día 1 si su fecha ya está disponible
    if (practice.completedDates.length === 0) {
      return index === 0;
    }

    // Encontrar el número más alto de día completado
    const completedDays = practice.completedDates.map(date => {
      const dateObj = new Date(date);
      const startDate = new Date(practice.startDate);
      return Math.floor((dateObj.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    });

    const maxCompletedDay = Math.max(...completedDays);
    const currentDay = index + 1;

    // Permitir clickear el siguiente día después del último completado
    return currentDay === maxCompletedDay + 1;
  };

  const getRemainingDays = () => {
    return practice.duration - (practice.completedDates.length || 0);
  };

  const dates = getDates();
  const remainingDays = getRemainingDays();

  return (
    <motion.div
      layout
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 overflow-hidden"
      ref={ref}
    >
      <div 
        className="p-4 sm:p-6 rounded-t-xl"
        style={{ background: `linear-gradient(to right, ${practice.color}CC, ${practice.color}99)` }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{practice.name}</h3>
            <p className="text-sm text-white/80">{remainingDays} days remaining</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(practice);
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(practice.id);
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        <Progress.Root className="relative overflow-hidden bg-white/20 rounded-full w-full h-2">
          <Progress.Indicator
            className="bg-white"
            style={{ 
              transform: `translateX(-${100 - (practice.completedDates.length / practice.duration * 100)}%)` 
            }}
            asChild
          >
            <motion.div 
              variants={progressBarVariants}
              initial="initial"
              animate="animate"
              custom={(practice.completedDates.length / practice.duration * 100)}
              className="w-full h-full transition-transform duration-500 ease-out"
            />
          </Progress.Indicator>
        </Progress.Root>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1 sm:gap-2">
          {dates.map((date, index) => {
            const dayNumber = index + 1;
            const isCompleted = isDateCompleted(date);
            const clickable = isDateClickable(date, index);

            return (
              <div key={date} className="relative group">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => clickable && onClick(practice.id, date)}
                  disabled={!clickable}
                  className={`
                    w-full aspect-square rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium
                    transition-all duration-200
                    ${isCompleted 
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-sm' 
                      : clickable
                        ? 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-300 dark:text-gray-500 opacity-50'
                    }
                    ${!clickable ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {dayNumber}
                </motion.button>

                <div 
                  className="
                    hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 
                    px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity whitespace-nowrap 
                    pointer-events-none z-50
                    shadow-lg
                  "
                >
                  {`Día ${dayNumber}`}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800 dark:border-t-gray-700"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
});