import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiUsers, 
  FiCheckCircle, 
  FiClock,
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi';
import { format } from 'date-fns';

const ProjectCard = ({ project }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
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

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Function to validate and clamp progress percentage between 0 and 100
  const getValidProgressPercentage = (percentage) => {
    const progress = percentage || 0;
    return Math.min(Math.max(progress, 0), 100);
  };

  const isOverdue = new Date(project.end_date) < new Date() && project.status !== 'completed';
  
  // Get validated progress percentage
  const validProgress = getValidProgressPercentage(project.progress_percentage);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    >
      <Link to={`/projects/${project.id}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {project.description}
              </p>
            </div>
            {isOverdue && (
              <FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 ml-2" />
            )}
          </div>

          {/* Status and Priority */}
          <div className="flex items-center space-x-2 mb-4">
            <span className={`badge ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
            <span className={`badge ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{validProgress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${getProgressColor(validProgress)}`}
                style={{ width: `${validProgress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <FiUsers className="h-4 w-4 mr-2" />
              <span>{project.team_members_count || 0} members</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FiCheckCircle className="h-4 w-4 mr-2" />
              <span>{project.completed_tasks_count || 0}/{project.tasks_count || 0} tasks</span>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <FiCalendar className="h-4 w-4 mr-1" />
              <span>Due {format(new Date(project.end_date), 'MMM dd')}</span>
            </div>
            <div className="flex items-center">
              <FiClock className="h-4 w-4 mr-1" />
              <span>{project.total_hours || 0}h</span>
            </div>
          </div>

          {/* Budget (if available) */}
          {project.budget && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Budget</span>
                <span className="font-medium text-gray-900">
                  ${project.budget.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProjectCard; 