import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'primary', className = '' }) => {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      
      {trend !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          {isPositive && <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />}
          {isNegative && <TrendingDown className="w-4 h-4 text-red-600 mr-1" />}
          <span className={`font-medium ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
            {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="ml-2 text-gray-500">{trendLabel}</span>}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
