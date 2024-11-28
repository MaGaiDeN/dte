import { Check, Circle } from 'lucide-react';

export function PracticeLegend() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 transition-colors p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Leyenda</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
            <Check className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm text-gray-600">Completado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
            <Circle className="w-5 h-5 text-gray-300" />
          </div>
          <span className="text-sm text-gray-600">Pendiente</span>
        </div>
      </div>
    </div>
  );
}