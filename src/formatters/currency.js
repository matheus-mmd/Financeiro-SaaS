/**
 * Currency Formatters
 */

export const formatCurrency = (value, currency = 'BRL', locale = 'pt-BR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

export const parseCurrency = (value) => {
  if (typeof value === 'number') return value;

  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};