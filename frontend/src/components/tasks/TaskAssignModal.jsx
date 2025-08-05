import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUser, FiCheck } from 'react-icons/fi';

const TaskAssignModal = ({ isOpen, onClose, task, users, currentAssignee, onAssign }) => {
  const [selectedUser, setSelectedUser] = useState(currentAssignee?.id || '');

  const handleAssign = () => {
    // Convert empty string to null for unassignment
    const assigneeId = selectedUser === '' ? null : selectedUser;
    onAssign(assigneeId);
  };

  const handleUnassign = () => {
    onAssign(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <FiUser className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Assign Task
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {task?.title}
              </h3>
              <p className="text-sm text-gray-600">
                {currentAssignee 
                  ? `Currently assigned to ${currentAssignee.first_name} ${currentAssignee.last_name}`
                  : 'This task is currently unassigned'
                }
              </p>
            </div>

            {/* User Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assign to:
              </label>
              
              {/* Unassigned Option */}
              <div className="mb-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="assignee"
                    value=""
                    checked={selectedUser === ''}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <FiUser className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Unassigned</p>
                      <p className="text-sm text-gray-500">Leave task unassigned</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* User Options */}
              <div className="space-y-2">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="assignee"
                      value={user.id}
                      checked={selectedUser === user.id}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500 break-all">{user.email}</p>
                      </div>
                      {currentAssignee?.id === user.id && (
                        <FiCheck className="ml-auto h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional spacing at bottom for better scroll experience */}
            <div className="h-4"></div>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {selectedUser ? 'Assign Task' : 'Unassign Task'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskAssignModal; 