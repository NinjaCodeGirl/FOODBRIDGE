import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="fb-card w-full max-w-md p-6 bg-white shadow-elevation relative animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-txt-secondary hover:text-txt-primary p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDestructive ? 'bg-red-50 text-status-danger border border-red-100' : 'bg-primary-light/50 text-primary border border-primary-light'
          }`}>
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 id="dialog-title" className="text-base font-bold text-txt-primary">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-txt-secondary mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border hover:bg-gray-50 text-xs sm:text-sm font-semibold text-txt-secondary transition-colors touch-target"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all shadow-sm touch-target ${
              isDestructive
                ? 'bg-status-danger hover:bg-red-700'
                : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
