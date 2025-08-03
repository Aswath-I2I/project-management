import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiX, FiSave, FiAlertCircle, FiFolder } from 'react-icons/fi';
import { projectsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProjectModal = ({ isOpen, onClose, project = null, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && project) {
        // Pre-fill form for editing
        setValue('name', project.name || '');
        setValue('description', project.description || '');
        setValue('status', project.status || 'active');
        setValue('priority', project.priority || 'medium');
        setValue('start_date', project.start_date ? project.start_date.split('T')[0] : '');
        setValue('end_date', project.end_date ? project.end_date.split('T')[0] : '');
        setValue('budget', project.budget || '');
      } else {
        // Reset form for creating
        reset();
        setValue('status', 'active');
        setValue('priority', 'medium');
      }
    }
  }, [isOpen, project, isEditing, setValue, reset]);

  const onSubmit = async (data) => {
    console.log('ProjectModal onSubmit called with data:', data);
    setIsLoading(true);
    try {
      const projectData = {
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        budget: data.budget ? parseFloat(data.budget) : null,
      };

      console.log('Sending project data:', projectData);

      let response;
      if (isEditing) {
        console.log('Updating project with ID:', project.id);
        response = await projectsAPI.update(project.id, projectData);
        toast.success('Project updated successfully!');
      } else {
        console.log('Creating new project');
        response = await projectsAPI.create(projectData);
        toast.success('Project created successfully!');
      }

      console.log('API response:', response);
      onSuccess(response.data.data);
      onClose();
    } catch (error) {
      console.error('Error in ProjectModal onSubmit:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save project';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
        style={{ isolation: 'isolate' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <FiFolder className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              {project ? 'Edit Project' : 'Create New Project'}
            </h2>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Project name is required' })}
                className={`w-full px-3 py-3 h-[42px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
                placeholder="Enter project description"
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Start Date and End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('start_date')}
                  className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  {...register('end_date')}
                  className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('budget')}
                className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter budget amount"
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>

            {/* Additional spacing at bottom for better scroll experience */}
            <div className="h-4"></div>
          </form>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit(onSubmit)();
            }}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="loading-spinner h-4 w-4 mr-2" />
            ) : (
              <FiSave className="mr-2" />
            )}
            {project ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectModal; 