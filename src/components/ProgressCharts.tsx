import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useEffect } from 'react';
import type { Practice } from '../types/Habit';

interface ProgressChartsProps {
  practices: Practice[];
}

export function ProgressCharts({ practices }: ProgressChartsProps) {
  // Preparar datos para el gráfico de progreso diario
  const getDailyProgress = () => {
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const completedPractices = practices.filter(practice => 
        practice.completedDates.includes(date)
      ).length;

      return {
        date: new Date(date).toLocaleDateString('es-ES', { 
          day: '2-digit',
          month: 'short'
        }),
        completadas: completedPractices,
        total: practices.length,
        porcentaje: practices.length > 0 
          ? Math.round((completedPractices / practices.length) * 100)
          : 0
      };
    });
  };

  // Preparar datos para el gráfico de progreso por práctica
  const getPracticeProgress = () => {
    return practices.map(practice => ({
      name: practice.name,
      progreso: Math.round(practice.progress),
      completados: practice.completedDates.length,
      color: practice.color
    }));
  };

  // Calcular estadísticas generales
  const getOverallStats = () => {
    const totalPractices = practices.length;
    const completedToday = practices.filter(practice => 
      practice.completedDates.includes(new Date().toISOString().split('T')[0])
    ).length;
    const averageProgress = practices.reduce((acc, practice) => acc + practice.progress, 0) / totalPractices;

    return [
      { name: 'Completadas Hoy', value: completedToday, display: `${completedToday} prácticas` },
      { name: 'Pendientes', value: totalPractices - completedToday, display: `${totalPractices - completedToday} prácticas` },
      { name: 'Progreso Promedio', value: Math.round(averageProgress), display: `${Math.round(averageProgress)}%` }
    ];
  };

  const COLORS = ['#4CAF50', '#ff9800', '#4f46e5'];

  useEffect(() => {
    // Establecer variables CSS para los colores según el modo
    const root = document.documentElement;
    const isDark = document.documentElement.classList.contains('dark');
    
    root.style.setProperty('--tooltip-bg', isDark ? '#374151' : '#ffffff');
    root.style.setProperty('--tooltip-text', isDark ? '#ffffff' : '#111827');
    root.style.setProperty('--text-color', isDark ? '#e5e7eb' : '#374151');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Gráfico de Progreso Diario */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Progreso Diario (Últimos 30 días)
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getDailyProgress()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                stroke="currentColor"
                tick={{ fill: 'currentColor' }}
                className="text-gray-600 dark:text-gray-300"
              />
              <YAxis 
                stroke="currentColor"
                tick={{ fill: 'currentColor' }}
                className="text-gray-600 dark:text-gray-300"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'var(--tooltip-text)',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{
                  color: 'var(--tooltip-text)'
                }}
                labelStyle={{
                  color: 'var(--tooltip-text)'
                }}
              />
              <Legend 
                wrapperStyle={{
                  color: 'var(--text-color)'
                }}
              />
              <Line
                type="monotone"
                dataKey="porcentaje"
                name="% Completado"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Progreso por Práctica */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Progreso por Práctica
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getPracticeProgress()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="name" 
                stroke="currentColor"
                tick={{ fill: 'currentColor' }}
                className="text-gray-600 dark:text-gray-300"
              />
              <YAxis 
                stroke="currentColor"
                tick={{ fill: 'currentColor' }}
                className="text-gray-600 dark:text-gray-300"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'var(--tooltip-text)',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{
                  color: 'var(--tooltip-text)'
                }}
                labelStyle={{
                  color: 'var(--tooltip-text)'
                }}
              />
              <Legend 
                wrapperStyle={{
                  color: 'var(--text-color)'
                }}
              />
              <Bar 
                dataKey="progreso" 
                name="Progreso (%)" 
                fill="#4f46e5"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen del Día */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Resumen del Día
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={400} height={300}>
              <Pie
                data={getOverallStats()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                  name
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return percent > 0.05 ? (
                    <text
                      x={x}
                      y={y}
                      fill="currentColor"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      {name}
                    </text>
                  ) : null;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getOverallStats().map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'var(--tooltip-text)',
                  padding: '0.75rem'
                }}
                formatter={(value: any, name: string) => {
                  const entry = getOverallStats().find(stat => stat.name === name);
                  return [entry?.display || value, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
