import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiX, FiSave, FiAlertCircle } from 'react-icons/fi';
import { milestonesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MilestoneModal = ({ isOpen, onClose, milestone = null, projectId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!milestone;

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
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset form when modal opens/closes or milestone changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && milestone) {
        // Pre-fill form for editing
        setValue('name', milestone.name || '');
        setValue('description', milestone.description || '');
        setValue('status', milestone.status || 'pending');
        setValue('due_date', milestone.due_date ? milestone.due_date.split('T')[0] : '');
      } else {
        // Reset form for creating
        reset();
        setValue('status', 'pending');
      }
    }
  }, [isOpen, milestone, isEditing, setValue, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const milestoneData = {
        name: data.name,
        description: data.description,
        status: data.status,
        due_date: data.due_date || null,
        project_id: projectId,
      };

      let response;
      if (isEditing) {
        response = await milestonesAPI.update(milestone.id, milestoneData);
        toast.success('Milestone updated successfully!');
      } else {
        response = await milestonesAPI.create(milestoneData);
        toast.success('Milestone created successfully!');
      }

      onSuccess(response.data.data);
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save milestone';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ isolation: 'isolate' }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex items-center justify-center min-h-screen p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto relative"
            style={{ zIndex: 9999 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Milestone' : 'Create New Milestone'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
              {/* Milestone Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Milestone Name *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', {
                    required: 'Milestone name is required',
                    maxLength: {
                      value: 255,
                      message: 'Milestone name must be less than 255 characters',
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter milestone name"
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  {...register('description', {
                    maxLength: {
                      value: 1000,
                      message: 'Description must be less than 1000 characters',
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter milestone description"
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Status and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    {...register('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="due_date"
                    {...register('due_date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {isLoading ? (
                    <div className="loading-spinner h-4 w-4 mr-2" />
                  ) : (
                    <FiSave className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Update Milestone' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default MilestoneModal; 