import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color 
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-pastel-blue',
      icon: 'text-blue-600',
      text: 'text-blue-900'
    },
    green: {
      bg: 'bg-pastel-green',
      icon: 'text-green-600',
      text: 'text-green-900'
    },
    red: {
      bg: 'bg-pastel-coral',
      icon: 'text-red-600',
      text: 'text-red-900'
    },
    purple: {
      bg: 'bg-pastel-purple',
      icon: 'text-purple-600',
      text: 'text-purple-900'
    }
  };

  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={`${colorClasses[color].bg} dark:bg-gray-800 rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colorClasses[color].text} dark:text-gray-100 opacity-70`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${colorClasses[color].text} dark:text-gray-100 mt-2`}>
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </p>
          {change && (
            <p className={`text-sm mt-2 ${changeColors[changeType || 'neutral']} dark:text-gray-100`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-white dark:bg-gray-700 bg-opacity-50`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].icon}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;