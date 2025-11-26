export * from './currency';
export * from './date';

export const calculateProgress = (progress, goal) => {
  if (goal === 0) return 0;
  return Math.min(Math.round((progress / goal) * 100), 100);
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};