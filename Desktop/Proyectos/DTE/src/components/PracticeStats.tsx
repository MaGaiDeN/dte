import { Flame, Award } from 'lucide-react';
import type { Practice } from '../types/Habit';

interface PracticeStatsProps {
  practices: Practice[];
}

export function PracticeStats({ practices }: PracticeStatsProps) {
  const totalCompletions = practices.reduce(
    (sum, practice) => sum + (practice.completedDates?.length || 0),
    0
  );

  const maxPossibleCompletions = practices.length > 0 ? practices.length * 60 : 1;
  const completionRate = practices.length > 0 
    ? Math.round((totalCompletions / maxPossibleCompletions) * 100) 
    : 0;

  const totalCurrentStreak = practices.reduce(
    (sum, practice) => sum + (practice.currentStreak || 0),
    0
  );

  const totalLongestStreak = practices.reduce(
    (sum, practice) => sum + (practice.longestStreak || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-indigo-100 hover:border-indigo-200 transition-colors p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Tasa de Completado</h3>
          <div className="flex items-center">
            <div className="ml-2 text-2xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {completionRate}%
            </div>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {totalCompletions} de {maxPossibleCompletions} prácticas
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-orange-100 hover:border-orange-200 transition-colors p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Flame className="h-5 w-5 text-orange-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Racha Actual</h3>
          </div>
          <div className="text-2xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            {totalCurrentStreak}
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">Días consecutivos en total</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-purple-100 hover:border-purple-200 transition-colors p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Mejor Racha</h3>
          </div>
          <div className="text-2xl font-semibold bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
            {totalLongestStreak}
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">Récord de días consecutivos</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-sm text-white p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium">Progreso Total</h3>
          <div className="text-2xl font-semibold">
            {practices.length > 0 
              ? Math.round((completionRate + (totalCurrentStreak / 60) * 100) / 2)
              : 0}%
          </div>
        </div>
        <p className="text-sm opacity-80">Camino hacia la iluminación</p>
      </div>
    </div>
  );
}