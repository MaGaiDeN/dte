import { Trash2, Settings } from 'lucide-react';
import type { Practice } from '../types/Habit';
import * as Progress from '@radix-ui/react-progress';

interface PracticeCardProps {
  practice: Practice;
  onDelete: (id: string) => void;
  onClick: (practiceId: string, date: string) => void;
  onEdit: (practice: Practice) => void;
}

export function PracticeCard({ practice, onDelete, onClick, onEdit }: PracticeCardProps) {
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
    return practice.completedDates.includes(date);
  };

  const isDateClickable = (dateStr: string, index: number) => {
    // If there are no completed dates, only allow day 1
    if (practice.completedDates.length === 0) {
      return index === 0;
    }

    // Find the highest day number completed
    const completedDays = practice.completedDates.map(date => {
      const dateObj = new Date(date);
      const startDate = new Date(practice.startDate);
      return Math.floor((dateObj.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    });

    const maxCompletedDay = Math.max(...completedDays);
    
    // Only allow clicking the next day after the highest completed day
    return index === maxCompletedDay;
  };

  const getRemainingDays = () => {
    return practice.duration - (practice.completedDates.length || 0);
  };

  const dates = getDates();
  const remainingDays = getRemainingDays();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 overflow-hidden">
      <div 
        className="p-4 sm:p-6 rounded-t-xl"
        style={{ background: `linear-gradient(to right, ${practice.color}CC, ${practice.color}99)` }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-white">
              {practice.name}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-white/80">
              {practice.description}
            </p>
            <div className="mt-2 flex items-center space-x-3">
              <p className="text-xs sm:text-sm text-white/90">
                {remainingDays > 0 
                  ? `${remainingDays} días restantes` 
                  : "Período completado"}
              </p>
              <span className="text-xs sm:text-sm text-white/90">•</span>
              <p className="text-xs sm:text-sm text-white/90">
                {practice.duration} días en total
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(practice)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('¿Estás seguro de que quieres eliminar esta práctica?')) {
                  onDelete(practice.id);
                }
              }}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-xs sm:text-sm text-white">
            <span className="opacity-90">Progreso</span>
            <span className="font-medium">{Math.round(practice.progress)}%</span>
          </div>
          <Progress.Root className="h-2 bg-white/20 rounded-full overflow-hidden">
            <Progress.Indicator
              className="h-full transition-all duration-500 ease-out rounded-full bg-white"
              style={{ width: `${practice.progress}%` }}
            />
          </Progress.Root>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1 sm:gap-2">
          {dates.map((date, index) => {
            const dayNumber = index + 1;
            const isCompleted = isDateCompleted(date);
            const clickable = isDateClickable(date, index);

            return (
              <div key={date} className="relative group">
                <button
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
                </button>

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
    </div>
  );
}