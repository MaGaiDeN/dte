import type { Reflection } from '../types/Reflection';

interface ReflectionListProps {
  reflections: Reflection[];
}

export function ReflectionList({ reflections }: ReflectionListProps) {
  return (
    <div className="space-y-6">
      {/* Stats section remains the same */}
      <div className="space-y-4">
        {reflections.map((reflection) => (
          <div key={reflection.id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {new Date(reflection.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  reflection.contemplation.level === 'deep' 
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {reflection.contemplation.level === 'deep' ? 'Contemplación Profunda' : 'Contemplación Superficial'}
                </span>
              </div>
              {/* Rest of the component remains unchanged */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}