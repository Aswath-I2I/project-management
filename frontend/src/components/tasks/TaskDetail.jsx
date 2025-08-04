import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTimes, 
  FaUser, 
  FaCalendar, 
  FaFlag, 
  FaEdit, 
  FaTrash,
  FaComment,
  FaClock
} from 'react-icons/fa';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import TaskProgressBar from './TaskProgressBar';
import TaskAssignModal from './TaskAssignModal';
import TaskModal from './TaskModal';
import CommentsSection from '../comments/CommentsSection';
import { useAuth } from '../../contexts/AuthContext';

const TaskDetail = ({ 
  task, 
  onClose, 
  onEdit, 
  onDelete, 
  onStatusUpdate, 
  onProgressUpdate, 
  onPriorityUpdate,
  onAssign, 
  users,
  projects = []
}) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAssignedUser = () => {
    if (!task.assigned_to) return null;
    return users.find(user => user.id === task.assigned_to);
  };

  const getValidProgressPercentage = (percentage) => {
    const progress = percentage || 0;
    return Math.min(Math.max(progress, 0), 100);
  };

  const assignedUser = getAssignedUser();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold text-gray-900">{task.title}</h2>
            <TaskStatusBadge status={task.status} onUpdate={(status) => onStatusUpdate(task.id, status)} />
            <TaskPriorityBadge priority={task.priority} onUpdate={(priority) => onPriorityUpdate(task.id, priority)} />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-3 text-gray-400 hover:text-blue-500 transition-colors"
              title="Edit Task"
            >
              <FaEdit size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-3 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete Task"
            >
              <FaTrash size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(95vh-140px)]">
          {/* Left Panel - Task Details */}
          <div className="w-1/2 p-8 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {task.description || 'No description provided'}
                </p>
              </div>

              {/* Task Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned To</h3>
                  <div className="flex items-center space-x-2">
                    {assignedUser ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                          {assignedUser.first_name?.charAt(0)}{assignedUser.last_name?.charAt(0)}
                        </div>
                        <span className="text-gray-900">
                          {assignedUser.first_name} {assignedUser.last_name}
                        </span>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        Assign Task
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                  <div className="flex items-center space-x-2">
                    <FaCalendar className="text-gray-400" size={14} />
                    <span className="text-gray-900">{formatDate(task.due_date)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {task.type || 'task'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-gray-400" size={14} />
                    <span className="text-gray-900">{formatDate(task.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                  <span className="text-sm text-gray-500">
                    {getValidProgressPercentage(task.progress_percentage)}%
                  </span>
                </div>
                <TaskProgressBar
                  progress={getValidProgressPercentage(task.progress_percentage)}
                  onUpdate={(progress) => onProgressUpdate(task.id, progress)}
                />
              </div>

              {/* Time Tracking */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Tracking</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Estimated Hours</span>
                    <p className="text-gray-900 font-medium">
                      {task.estimated_hours || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Actual Hours</span>
                    <p className="text-gray-900 font-medium">
                      {task.actual_hours || 'Not logged'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Comments */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <CommentsSection
              entityType="task"
              entityId={task.id}
              currentUserId={user?.id}
            />
          </div>
        </div>

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

        {/* Edit Task Modal */}
        <TaskModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          task={task}
          projects={[]} // We'll need to pass projects if needed
          users={users}
          onSave={(updatedTask) => {
            // Call the parent's onEdit handler with the updated task
            if (onEdit) {
              onEdit(updatedTask);
            }
            setShowEditModal(false);
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default TaskDetail; 