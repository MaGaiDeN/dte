import { Check, Circle } from 'lucide-react';
import type { Practice } from '../types/Habit';

interface PracticeGridProps {
  practices: Practice[];
  onDateClick: (date: string, practiceId: string) => void;
}

export function PracticeGrid({ practices, onDateClick }: PracticeGridProps) {
  const dates = Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  // Group dates by month for better organization
  const datesByMonth = dates.reduce((acc, date) => {
    const monthYear = new Date(date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(date);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="space-y-8">
      {practices.map(practice => (
        <div 
          key={practice.id} 
          className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-200 overflow-hidden"
        >
          <div 
            className="p-6"
            style={{ background: `linear-gradient(to right, ${practice.color}, ${practice.color}CC)` }}
          >
            <h3 className="text-lg font-medium text-white">
              {practice.name}
            </h3>
            <p className="mt-1 text-sm text-white/80">
              {practice.description}
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {Object.entries(datesByMonth).map(([monthYear, monthDates]) => (
              <div key={monthYear} className="space-y-3">
                <h4 className="text-sm font-medium text-gray-500 capitalize">
                  {monthYear}
                </h4>
                <div className="grid grid-cols-7 gap-2">
                  {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
                    <div key={day} className="text-xs font-medium text-gray-400 text-center">
                      {day}
                    </div>
                  ))}
                  {monthDates.map(date => {
                    const dayDate = new Date(date);
                    const day = dayDate.getDate();
                    const dayOfWeek = dayDate.getDay();
                    const isCompleted = practice.completedDates.includes(date);
                    const isFuture = new Date(date) > new Date();
                    
                    // Add empty cells for proper day alignment
                    const firstDayOfMonth = new Date(monthDates[0]).getDay();
                    const emptyDays = dayOfWeek === 0 ? [] : Array(firstDayOfMonth).fill(null);
                    
                    return (
                      <>
                        {emptyDays.map((_, index) => (
                          <div key={`empty-${index}`} className="aspect-square" />
                        ))}
                        <button
                          key={date}
                          onClick={() => !isFuture && onDateClick(date, practice.id)}
                          disabled={isFuture}
                          className={`
                            relative aspect-square rounded-lg flex flex-col items-center justify-center
                            transition-all duration-200 group
                            ${isCompleted 
                              ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-sm' 
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            }
                            ${isFuture ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                          `}
                        >
                          <span className="text-xs font-medium mb-1">
                            {day}
                          </span>
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {new Date(date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </button>
                      </>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}