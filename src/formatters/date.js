/**
 * Date Formatters
 */

export const formatDate = (dateString, locale = 'pt-BR') => {
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(locale);
};

export const formatDateTime = (dateString, locale = 'pt-BR') => {
  const date = new Date(dateString);
  return date.toLocaleString(locale);
};

export const toISODate = (date) => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

export const getCurrentMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: firstDay, to: lastDay };
};

export const getPreviousMonth = (currentMonth) => {
  const [year, month] = currentMonth.split('-').map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
};