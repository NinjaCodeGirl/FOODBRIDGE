import React from 'react';

export default function FilterBar({
  options = [],
  activeValue,
  onChange,
  className = ''
}) {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none ${className}`}>
      {options.map((option) => {
        const isActive = activeValue === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 touch-target ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-border text-txt-secondary hover:text-txt-primary hover:bg-gray-50'
            }`}
          >
            {option.icon && (
              <span className="w-3.5 h-3.5 flex items-center justify-center">
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-primary-dark text-white'
                    : 'bg-gray-100 text-txt-secondary'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
