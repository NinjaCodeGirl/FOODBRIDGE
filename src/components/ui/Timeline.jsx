import React from 'react';
import { Check, Clock, Circle } from 'lucide-react';

export default function Timeline({ steps = [], currentStepIndex = 0, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isPending = index > currentStepIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="flex items-start gap-3.5 relative">
            {/* Connecting Vertical Line */}
            {!isLast && (
              <div
                className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-[1px] ${
                  isCompleted ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}

            {/* Step Icon */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 flex-shrink-0 transition-colors ${
                isCompleted
                  ? 'bg-primary text-white shadow-sm'
                  : isCurrent
                  ? 'bg-primary-light text-primary ring-4 ring-primary-light/50 border border-primary'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : isCurrent ? (
                <Clock className="w-3.5 h-3.5 animate-pulse" />
              ) : (
                <span className="text-[10px]">{index + 1}</span>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span
                  className={`text-xs sm:text-sm font-bold ${
                    isCurrent ? 'text-primary font-extrabold' : isCompleted ? 'text-txt-primary' : 'text-txt-muted'
                  }`}
                >
                  {step.title}
                </span>
                {step.timestamp && (
                  <span className="text-[11px] text-txt-secondary font-medium">
                    {step.timestamp}
                  </span>
                )}
              </div>
              {step.description && (
                <p className="text-xs text-txt-secondary mt-0.5 leading-relaxed">
                  {step.description}
                </p>
              )}
              {step.actor && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary-light/40 border border-primary-light/60">
                  {step.actor}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
