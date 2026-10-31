import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isWarning = type === 'warning';
  const isError = type === 'error';

  const styles = isSuccess ? {
    bg: 'bg-emerald-900 text-white border-emerald-700',
    icon: CheckCircle2,
    iconColor: 'text-emerald-300'
  } : isWarning ? {
    bg: 'bg-amber-900 text-white border-amber-700',
    icon: AlertTriangle,
    iconColor: 'text-amber-300'
  } : isError ? {
    bg: 'bg-red-900 text-white border-red-700',
    icon: AlertCircle,
    iconColor: 'text-red-300'
  } : {
    bg: 'bg-gray-900 text-white border-gray-700',
    icon: Info,
    iconColor: 'text-blue-300'
  };

  const Icon = styles.icon;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full animate-slideUp">
      <div className={`p-4 rounded-xl border shadow-elevation flex items-center justify-between gap-3 ${styles.bg}`}>
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 flex-shrink-0 ${styles.iconColor}`} />
          <p className="text-xs sm:text-sm font-medium leading-snug">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
