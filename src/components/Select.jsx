import React from 'react';

/**
 * Componente Select - Dropdown reutilizável
 * @param {string} label - Label do select
 * @param {string} value - Valor selecionado
 * @param {function} onChange - Callback quando o valor muda
 * @param {Array} options - Array de opções: [{ value, label }]
 * @param {string} placeholder - Placeholder quando não há seleção
 * @param {string} className - Classes adicionais
 * @param {boolean} required - Campo obrigatório
 */
export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
  className = '',
  required = false,
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-white text-gray-900"
        required={required}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
