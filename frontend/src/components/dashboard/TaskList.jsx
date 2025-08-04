import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiUser,
  FiCalendar
} from 'react-icons/fi';
import { format } from 'date-fns';

const TaskList = ({ tasks, onTaskClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  // Function to validate and clamp progress percentage between 0 and 100
  const getValidProgressPercentage = (percentage) => {
    const progress = percentage || 0;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handleTaskClick = (task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <FiCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks assigned</h3>
        <p className="mt-1 text-sm text-gray-500">
          You're all caught up! No tasks are currently assigned to you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div
            onClick={() => handleTaskClick(task)}
            className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </h4>
                  {isOverdue(task.due_date) && task.status !== 'completed' && (
                    <FiAlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {task.description}
                </p>

                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <FiUser className="h-3 w-3 mr-1" />
                    <span>{task.project_name}</span>
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="h-3 w-3 mr-1" />
                    <span>Due {format(new Date(task.due_date), 'MMM dd')}</span>
                  </div>
                  {task.estimated_hours && (
                    <div className="flex items-center">
                      <FiClock className="h-3 w-3 mr-1" />
                      <span>{task.estimated_hours}h</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4 flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={`badge ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`badge ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>

                {task.progress_percentage !== undefined && (
                  <div className="w-20">
                    <div className="progress-bar h-1">
                      <div
                        className="progress-fill bg-blue-500"
                        style={{ width: `${getValidProgressPercentage(task.progress_percentage)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {getValidProgressPercentage(task.progress_percentage)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {tasks.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <a
            href="/tasks"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all tasks →
          </a>
        </div>
      )}
    </div>
  );
};

export default TaskList; 