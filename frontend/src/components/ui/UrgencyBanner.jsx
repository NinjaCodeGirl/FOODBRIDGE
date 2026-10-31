import React from 'react';
import { AlertTriangle, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

export default function UrgencyBanner({
  title,
  subtitle,
  timeLeft,
  severity = 'warning', // 'warning' (orange) | 'danger' (red) | 'info' (blue)
  actionLabel = 'Resolve',
  onAction,
  className = ''
}) {
  const isDanger = severity === 'danger';
  const isInfo = severity === 'info';

  const styles = isDanger ? {
    bg: 'bg-red-50 border-red-200',
    iconBg: 'bg-red-100 text-status-danger',
    textTitle: 'text-red-900',
    textSub: 'text-red-700',
    badge: 'bg-red-100 text-red-800 border-red-200',
    btn: 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
  } : isInfo ? {
    bg: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100 text-status-info',
    textTitle: 'text-blue-900',
    textSub: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
  } : {
    // Default: Orange urgency
    bg: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100 text-status-warning',
    textTitle: 'text-amber-950',
    textSub: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
  };

  return (
    <div className={`p-4 rounded-xl border ${styles.bg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${styles.iconBg}`}>
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`text-sm font-bold ${styles.textTitle}`}>
              {title}
            </h4>
            {timeLeft && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${styles.badge}`}>
                <Clock className="w-3 h-3" />
                {timeLeft}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`text-xs mt-0.5 ${styles.textSub}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actionLabel && (
        <button
          onClick={onAction}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors flex-shrink-0 touch-target ${styles.btn}`}
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
