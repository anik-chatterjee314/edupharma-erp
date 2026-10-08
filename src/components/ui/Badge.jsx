import React from 'react';

const Badge = ({ variant = 'neutral', children, className = '', dot = false }) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-600/10',
    info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10',
    neutral: 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/10',
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {dot && (
        <svg className={`mr-1.5 h-2 w-2 rounded-full ${dotColors[variant]}`} fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
      )}
      {children}
    </span>
  );
};

export default Badge;
