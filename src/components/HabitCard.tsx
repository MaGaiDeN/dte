import { Trash2, PlusCircle } from 'lucide-react';
import type { Practice } from '../types/Habit';
import * as Progress from '@radix-ui/react-progress';

interface HabitCardProps {
  practice: Practice;
  onDelete: (id: string) => void;
  onProgress: (id: string) => void;
}

export function HabitCard({ practice, onDelete, onProgress }: HabitCardProps) {
  const borderColor = `border-l-[6px]`;
  const progress = practice.progress || 0; // Ensure progress is never undefined
  const isCompleted = progress >= 100;

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm ${borderColor} border-l-[${practice.color}] hover:shadow-md transition-shadow p-6`}
      style={{ borderLeftColor: practice.color }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{practice.name}</h3>
          {practice.description && (
            <p className="text-sm text-gray-600 mt-1">{practice.description}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onProgress(practice.id)}
            disabled={isCompleted}
            className={`p-2 rounded-full transition-colors ${
              isCompleted
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(practice.id)}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Progreso</span>
          <span className="font-medium text-gray-900">{progress}%</span>
        </div>
        <Progress.Root className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <Progress.Indicator
            className="h-full transition-transform duration-500 ease-out rounded-full"
            style={{
              backgroundColor: practice.color,
              transform: `translateX(-${100 - progress}%)`,
            }}
          />
        </Progress.Root>
      </div>
    </div>
  );
}