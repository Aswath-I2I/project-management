import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiX, FiSave, FiAlertCircle, FiUser } from 'react-icons/fi';
import { teamAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TeamMemberModal = ({ isOpen, onClose, projectId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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

  // Fetch available users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
      reset();
      setValue('role', 'member');
    }
  }, [isOpen, projectId]);

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await teamAPI.getAllUsers();
      setAvailableUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load available users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const memberData = {
        user_id: data.user_id,
        role: data.role,
      };

      await teamAPI.addToProject(projectId, memberData);
      toast.success('Team member added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add team member';
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
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto relative"
            style={{ zIndex: 9999 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Add Team Member
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
              {/* User Selection */}
              <div>
                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Select User *
                </label>
                {loadingUsers ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    Loading users...
                  </div>
                ) : (
                  <select
                    id="user_id"
                    {...register('user_id', {
                      required: 'Please select a user',
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.user_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
                {errors.user_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.user_id.message}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  {...register('role', {
                    required: 'Please select a role',
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <option value="member">Member</option>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="tester">Tester</option>
                  <option value="analyst">Analyst</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="team_lead">Team Lead</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.role.message}
                  </p>
                )}
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
                    <FiUser className="h-4 w-4 mr-2" />
                  )}
                  Add Member
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default TeamMemberModal; 