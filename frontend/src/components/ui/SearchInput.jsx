import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  onClear,
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 text-txt-secondary absolute left-3.5 pointer-events-none" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white text-txt-primary pl-10 pr-9 py-2 rounded-xl border border-border text-xs sm:text-sm placeholder:text-txt-muted focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          className="absolute right-2.5 p-1 rounded-md text-txt-secondary hover:text-txt-primary hover:bg-gray-100 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
