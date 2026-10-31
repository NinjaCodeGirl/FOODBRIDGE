import React from 'react';
import { TrendingUp, Info } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtext,
  change,
  isPositive = true,
  icon: Icon,
  isDemo = false,
  badge,
  className = '',
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className={`fb-card p-5 flex flex-col justify-between relative ${
        onClick ? 'cursor-pointer hover:border-emerald-300 hover:shadow-card-hover' : ''
      } ${className}`}
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Top Header: Title & Icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-txt-secondary">
            {title}
          </span>
          {isDemo && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
              Demo
            </span>
          )}
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {badge}
            </span>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-light/50 border border-primary-light flex items-center justify-center text-primary flex-shrink-0">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-txt-primary tracking-tight">
          {value}
        </div>

        {/* Change or Subtext */}
        {(change || subtext) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {change && (
              <span className={`inline-flex items-center font-medium ${isPositive ? 'text-status-success' : 'text-status-danger'}`}>
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {change}
              </span>
            )}
            {subtext && (
              <span className="text-txt-secondary truncate">
                {subtext}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
