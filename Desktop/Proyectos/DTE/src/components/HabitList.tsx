import { Check, X, Award, Flame } from 'lucide-react';
import { Habit, HabitCategory } from '../types/Habit';

interface HabitListProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => void;
}

const categoryColors: Record<HabitCategory, string> = {
  health: 'text-green-600 bg-green-100',
  work: 'text-blue-600 bg-blue-100',
  learning: 'text-purple-600 bg-purple-100',
  social: 'text-yellow-600 bg-yellow-100',
  personal: 'text-pink-600 bg-pink-100',
  other: 'text-gray-600 bg-gray-100',
};

const categoryLabels: Record<HabitCategory, string> = {
  health: 'Salud',
  work: 'Trabajo',
  learning: 'Aprendizaje',
  social: 'Social',
  personal: 'Personal',
  other: 'Otro',
};

export function HabitList({ habits, onToggleHabit }: HabitListProps) {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const getDayName = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', { weekday: 'short' });
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hábito
            </th>
            {dates.map(date => (
              <th key={date} className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div>{getDayName(date)}</div>
                <div>{new Date(date).getDate()}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {habits.map(habit => (
            <tr key={habit.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col space-y-2">
                  <div className="text-sm font-medium text-gray-900">{habit.name}</div>
                  {habit.description && (
                    <div className="text-sm text-gray-500">{habit.description}</div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[habit.category]}`}>
                      {categoryLabels[habit.category]}
                    </span>
                    {habit.currentStreak > 0 && (
                      <span className="inline-flex items-center text-orange-500">
                        <Flame className="w-4 h-4 mr-1" />
                        <span className="text-xs font-medium">{habit.currentStreak}</span>
                      </span>
                    )}
                    {habit.longestStreak > 0 && (
                      <span className="inline-flex items-center text-purple-500">
                        <Award className="w-4 h-4 mr-1" />
                        <span className="text-xs font-medium">{habit.longestStreak}</span>
                      </span>
                    )}
                  </div>
                </div>
              </td>
              {dates.map(date => {
                const isCompleted = habit.completedDates.includes(date);
                return (
                  <td key={date} className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onToggleHabit(habit.id, date)}
                      className={`p-2 rounded-full transition-colors ${
                        isCompleted 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}