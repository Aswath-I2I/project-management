import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiSave, FiCalendar, FiUser, FiFlag, FiFileText } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { tasksAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TaskModal = ({ isOpen, onClose, task, projects, users, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch
  } = useForm();

  const watchPriority = watch('priority', 'medium');
  const watchStatus = watch('status', 'pending');

  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Editing existing task
        setValue('title', task.title);
        setValue('description', task.description);
        setValue('priority', task.priority);
        setValue('status', task.status);
        setValue('due_date', task.due_date ? task.due_date.split('T')[0] : '');
        setValue('estimated_hours', task.estimated_hours || '');
        setSelectedProject(task.project_id || '');
        setSelectedAssignee(task.assigned_to || '');
      } else {
        // Creating new task
        reset();
        setSelectedProject('');
        setSelectedAssignee('');
      }
    }
  }, [isOpen, task, setValue, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const taskData = {
        ...data,
        project_id: selectedProject || null,
        assigned_to: selectedAssignee || null, // Will be auto-assigned to creator if null
        estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null
      };

      let response;
      if (task) {
        // Update existing task
        response = await tasksAPI.update(task.id, taskData);
      } else {
        // Create new task
        response = await tasksAPI.create(taskData);
      }

      onSave(response.data.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save task';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedProject('');
    setSelectedAssignee('');
    onClose();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'border-gray-500 bg-gray-50';
      case 'in_progress': return 'border-blue-500 bg-blue-50';
      case 'review': return 'border-purple-500 bg-purple-50';
      case 'completed': return 'border-green-500 bg-green-50';
      case 'closed': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <FiFileText className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Task title is required' })}
                className={`w-full px-3 py-3 h-[42px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task description"
              />
            </div>

            {/* Project and Assignee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiFlag className="inline h-4 w-4 mr-1" />
                  Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline h-4 w-4 mr-1" />
                  Assignee
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.username})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No users available</option>
                  )}
                </select>
                {users && users.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">No users available for assignment</p>
                )}
              </div>
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className={`w-full px-3 py-3 h-[42px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getPriorityColor(watchPriority)}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className={`w-full px-3 py-3 h-[42px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(watchStatus)}`}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Due Date and Estimated Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline h-4 w-4 mr-1" />
                  Due Date
                </label>
                <input
                  type="date"
                  {...register('due_date')}
                  className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  {...register('estimated_hours')}
                  className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 8.5"
                />
              </div>
            </div>

            {/* Additional spacing at bottom for better scroll experience */}
            <div className="h-4"></div>
          </form>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="loading-spinner h-4 w-4 mr-2" />
            ) : (
              <FiSave className="mr-2" />
            )}
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskModal; 