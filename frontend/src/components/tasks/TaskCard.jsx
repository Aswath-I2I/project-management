import React, { useState, useRef } from 'react';
import { FiEdit, FiTrash2, FiUser, FiCalendar, FiFlag, FiMoreVertical } from 'react-icons/fi';
import { motion } from 'framer-motion';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import TaskProgressBar from './TaskProgressBar';
import TaskAssignModal from './TaskAssignModal';

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusUpdate, 
  onProgressUpdate, 
  onPriorityUpdate,
  onAssign, 
  users 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const actionsRef = useRef(null);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getAssignedUser = () => {
    if (!task.assigned_to) return null;
    return users.find(user => user.id === task.assigned_to);
  };

  // Function to validate and clamp progress percentage between 0 and 100
  const getValidProgressPercentage = (percentage) => {
    const progress = percentage || 0;
    return Math.min(Math.max(progress, 0), 100);
  };

  const assignedUser = getAssignedUser();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {task.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            </div>
            <div className="relative ml-3">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <FiMoreVertical className="h-4 w-4 text-gray-500" />
              </button>
              
              {/* Actions Dropdown */}
              {showActions && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit(task);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiEdit className="mr-3 h-4 w-4" />
                      Edit Task
                    </button>
                    <button
                      onClick={() => {
                        setShowAssignModal(true);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiUser className="mr-3 h-4 w-4" />
                      Assign Task
                    </button>
                    <button
                      onClick={() => {
                        onDelete(task.id);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FiTrash2 className="mr-3 h-4 w-4" />
                      Delete Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Status and Priority */}
          <div className="flex items-center justify-between mb-3">
            <TaskStatusBadge status={task.status} onUpdate={(status) => onStatusUpdate(task.id, status)} />
            <TaskPriorityBadge priority={task.priority} onUpdate={(priority) => onPriorityUpdate(task.id, priority)} />
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{getValidProgressPercentage(task.progress_percentage)}%</span>
            </div>
            <TaskProgressBar 
              progress={getValidProgressPercentage(task.progress_percentage)} 
              onUpdate={(progress) => onProgressUpdate(task.id, progress)}
            />
          </div>

          {/* Assigned User */}
          <div className="flex items-center mb-3">
            <FiUser className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {assignedUser ? (
                <span className="font-medium">
                  {assignedUser.first_name} {assignedUser.last_name}
                </span>
              ) : (
                <span className="text-gray-500">Unassigned</span>
              )}
            </span>
          </div>

          {/* Due Date */}
          <div className="flex items-center mb-3">
            <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className={`text-sm ${
              new Date(task.due_date) < new Date() && task.status !== 'completed'
                ? 'text-red-600 font-medium'
                : 'text-gray-600'
            }`}>
              {formatDate(task.due_date)}
            </span>
          </div>

          {/* Project */}
          {task.project_name && (
            <div className="flex items-center">
              <FiFlag className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{task.project_name}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
            {task.updated_at !== task.created_at && (
              <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Assign Modal */}
      <TaskAssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        task={task}
        users={users}
        currentAssignee={assignedUser}
        onAssign={(userId) => {
          onAssign(task.id, userId);
          setShowAssignModal(false);
        }}
      />
    </>
  );
};

export default TaskCard; 