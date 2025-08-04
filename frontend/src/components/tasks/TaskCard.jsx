import React, { useState, useRef } from 'react';
import { FiEdit, FiTrash2, FiUser, FiCalendar, FiFlag, FiMoreVertical, FiMessageSquare } from 'react-icons/fi';
import { motion } from 'framer-motion';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import TaskProgressBar from './TaskProgressBar';
import TaskAssignModal from './TaskAssignModal';
import TaskDetail from './TaskDetail';

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
  const [showTaskDetail, setShowTaskDetail] = useState(false);
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
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
        onClick={() => setShowTaskDetail(true)}
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
          </div>

          {/* Status and Priority */}
          <div className="flex items-center space-x-2 mt-3">
            <TaskStatusBadge status={task.status} onUpdate={(status) => onStatusUpdate(task.id, status)} />
            <TaskPriorityBadge priority={task.priority} onUpdate={(priority) => onPriorityUpdate(task.id, priority)} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Assigned User */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {assignedUser ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                    {assignedUser.first_name?.charAt(0)}{assignedUser.last_name?.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-700">
                    {assignedUser.first_name} {assignedUser.last_name}
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">Unassigned</span>
              )}
            </div>

            {/* Comment Count */}
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <FiMessageSquare size={14} />
              <span>{task.comments_count || 0}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs text-gray-500">
                {getValidProgressPercentage(task.progress_percentage)}%
              </span>
            </div>
            <TaskProgressBar
              progress={getValidProgressPercentage(task.progress_percentage)}
              onUpdate={(progress) => onProgressUpdate(task.id, progress)}
            />
          </div>

          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FiCalendar size={14} />
              <span>Due {formatDate(task.due_date)}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Task Detail Modal */}
      {showTaskDetail && (
        <TaskDetail
          task={task}
          onClose={() => setShowTaskDetail(false)}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusUpdate={onStatusUpdate}
          onProgressUpdate={onProgressUpdate}
          onPriorityUpdate={onPriorityUpdate}
          onAssign={onAssign}
          users={users}
        />
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <TaskAssignModal
          task={task}
          users={users}
          onAssign={(userId) => {
            onAssign(task.id, userId);
            setShowAssignModal(false);
          }}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </>
  );
};

export default TaskCard; 