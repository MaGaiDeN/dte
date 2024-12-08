/**
 * Utility functions for date handling
 */

/**
 * Formats a Date object to YYYY-MM-DD string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Gets the day name in Spanish for a given date
 */
export const getDayName = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
};

/**
 * Gets an array of dates for the last N days
 */
export const getLastNDays = (days: number): string[] => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return formatDate(date);
  }).reverse();
};

/**
 * Formats a date to a human-readable string in Spanish
 */
export const formatDateToHuman = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Checks if a date is the first day of the month
 */
export const isFirstDayOfMonth = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getDate() === 1;
};

/**
 * Checks if a date is in the future
 */
export const isFutureDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj > today;
};

/**
 * Groups dates by month
 */
export const groupDatesByMonth = (dates: string[]): Record<string, string[]> => {
  return dates.reduce((acc, date) => {
    const monthYear = new Date(date).toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(date);
    return acc;
  }, {} as Record<string, string[]>);
};
