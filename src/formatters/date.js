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

/**
 * Parse a date string (YYYY-MM-DD) into a Date object
 * Avoids timezone issues by using local date construction
 * @param {string} dateString - Date in format YYYY-MM-DD
 * @returns {Date} Date object
 */
export const parseDateString = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

/**
 * Check if a date is within a given range
 * @param {string} dateString - Date string in format YYYY-MM-DD
 * @param {Object} range - Object with from and to Date properties
 * @returns {boolean}
 */
export const isDateInRange = (dateString, range) => {
  if (!range?.from || !range?.to || !dateString) return true;

  const date = parseDateString(dateString);
  date.setHours(0, 0, 0, 0);

  const from = new Date(range.from);
  from.setHours(0, 0, 0, 0);

  const to = new Date(range.to);
  to.setHours(23, 59, 59, 999);

  return date >= from && date <= to;
};

/**
 * Get the first and last day of a specific month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Object} Object with from and to Date properties
 */
export const getMonthRange = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  return { from: firstDay, to: lastDay };
};