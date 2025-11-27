import React from 'react';

/**
 * SegmentedControl - Toggle moderno para alternar entre opções
 * Baseado no design de toggle pills comum em dashboards modernos
 */
export default function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg ${className}`}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}