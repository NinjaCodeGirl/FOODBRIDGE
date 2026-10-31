import React from 'react';

export default function LoadingSkeleton({ variant = 'card', count = 1, className = '' }) {
  const items = Array.from({ length: count });

  if (variant === 'stats') {
    return (
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="fb-card p-5 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-8 w-28 bg-gray-300 rounded mt-4" />
            <div className="h-3 w-36 bg-gray-200 rounded mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`fb-card overflow-hidden animate-pulse ${className}`}>
        <div className="p-4 border-b border-border bg-gray-50 flex gap-4">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded ml-auto" />
        </div>
        <div className="divide-y divide-border">
          {items.map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 bg-gray-300 rounded" />
                <div className="h-3 w-1/4 bg-gray-200 rounded" />
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
              <div className="h-8 w-24 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: Card variant
  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="fb-card p-6 animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-1/3 bg-gray-300 rounded" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-9 w-full bg-gray-200 rounded-lg pt-2" />
        </div>
      ))}
    </div>
  );
}
