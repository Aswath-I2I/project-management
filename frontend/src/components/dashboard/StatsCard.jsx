import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({ title, value, icon: Icon, color, change, changeType }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          icon: 'text-blue-600',
          border: 'border-blue-200',
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          icon: 'text-green-600',
          border: 'border-green-200',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          icon: 'text-purple-600',
          border: 'border-purple-200',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          icon: 'text-orange-600',
          border: 'border-orange-200',
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          icon: 'text-red-600',
          border: 'border-red-200',
        };
      default:
        return {
          bg: 'bg-gray-50',
          icon: 'text-gray-600',
          border: 'border-gray-200',
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`card ${colorClasses.border} hover:shadow-lg transition-all duration-200`}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses.bg}`}>
            <Icon className={`h-6 w-6 ${colorClasses.icon}`} />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        
        {change && (
          <div className="mt-4 flex items-center">
            {changeType === 'increase' ? (
              <FiTrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <FiTrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`ml-2 text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change}
            </span>
            <span className="ml-1 text-sm text-gray-500">from last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard; 