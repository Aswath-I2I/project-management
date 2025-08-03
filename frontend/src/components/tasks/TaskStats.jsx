import React from 'react';
import { FiCheckCircle, FiClock, FiAlertCircle, FiPause, FiTrendingUp } from 'react-icons/fi';

const TaskStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: FiTrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: FiCheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'In Progress',
      value: stats.in_progress,
      icon: FiClock,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: FiAlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="mb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg p-4 border border-gray-200`}
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{stats.completed} completed</span>
          <span>{stats.total - stats.completed} remaining</span>
        </div>
      </div>
    </div>
  );
};

export default TaskStats; 