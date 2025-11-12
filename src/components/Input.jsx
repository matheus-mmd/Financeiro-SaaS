import React from 'react';

/**
 * Componente Input - Campo de entrada reutilizável
 * @param {string} label - Rótulo do campo
 * @param {string} type - Tipo do input
 * @param {string} placeholder - Placeholder
 * @param {string} error - Mensagem de erro
 * @param {boolean} required - Campo obrigatório
 */
export default function Input({
  label,
  type = 'text',
  placeholder,
  error,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500" id={`${props.id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
