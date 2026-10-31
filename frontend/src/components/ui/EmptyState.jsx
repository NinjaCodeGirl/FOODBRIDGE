import React from 'react';
import { PackageOpen, AlertCircle, RefreshCw } from 'lucide-react';

export default function EmptyState({
  title = 'No items found',
  description = 'There are no active records matching your criteria.',
  icon: Icon = PackageOpen,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  isError = false,
  className = ''
}) {
  return (
    <div className={`fb-card p-8 sm:p-12 text-center flex flex-col items-center justify-center ${className}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
        isError ? 'bg-red-50 text-status-danger border border-red-100' : 'bg-primary-light/40 text-primary border border-primary-light'
      }`}>
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-txt-primary">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-txt-secondary mt-1.5 max-w-md leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <button
              onClick={onAction}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md touch-target flex items-center gap-1.5"
            >
              {isError && <RefreshCw className="w-4 h-4 mr-1" />}
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryLabel && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2.5 rounded-xl border border-border hover:bg-gray-50 text-txt-secondary text-xs sm:text-sm font-medium transition-all touch-target"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
