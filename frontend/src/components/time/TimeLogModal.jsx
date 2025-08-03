import React, { useState, useEffect } from 'react';
import { FiX, FiClock, FiFileText, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { timeAPI, tasksAPI, projectsAPI } from '../../services/api';

const TimeLogModal = ({ isOpen, onClose, timeLog = null, onSave }) => {
  const [formData, setFormData] = useState({
    task_id: '',
    project_id: '',
    description: '',
    hours_spent: '',
    date: new Date().toISOString().split('T')[0],
    is_billable: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchTasksAndProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (timeLog) {
      setFormData({
        task_id: timeLog.task_id || '',
        project_id: timeLog.project_id || '',
        description: timeLog.description || '',
        hours_spent: timeLog.hours_spent?.toString() || '',
        date: timeLog.date || new Date().toISOString().split('T')[0],
        is_billable: timeLog.is_billable !== undefined ? timeLog.is_billable : true
      });
    } else {
      setFormData({
        task_id: '',
        project_id: '',
        description: '',
        hours_spent: '',
        date: new Date().toISOString().split('T')[0],
        is_billable: true
      });
    }
    setErrors({});
  }, [timeLog, isOpen]);

  useEffect(() => {
    // Filter tasks based on selected project
    if (formData.project_id) {
      const filtered = tasks.filter(task => task.project_id === formData.project_id);
      setFilteredTasks(filtered);
      // Clear task selection if current task is not in filtered list
      if (formData.task_id && !filtered.find(t => t.id === formData.task_id)) {
        setFormData(prev => ({ ...prev, task_id: '' }));
      }
    } else {
      setFilteredTasks(tasks);
    }
  }, [formData.project_id, tasks]);

  const fetchTasksAndProjects = async () => {
    try {
      const [tasksResponse, projectsResponse] = await Promise.all([
        tasksAPI.getAll(),
        projectsAPI.getAll()
      ]);
      
      setTasks(tasksResponse.data.data || []);
      setProjects(projectsResponse.data.data || []);
      setFilteredTasks(tasksResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks and projects:', error);
      toast.error('Failed to load tasks and projects');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.project_id) {
      newErrors.project_id = 'Project is required';
    }

    if (!formData.task_id) {
      newErrors.task_id = 'Task is required';
    }

    if (!formData.hours_spent || parseFloat(formData.hours_spent) <= 0) {
      newErrors.hours_spent = 'Hours must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        hours_spent: parseFloat(formData.hours_spent)
      };

      let response;
      if (timeLog) {
        response = await timeAPI.updateTime(timeLog.id, submitData);
      } else {
        response = await timeAPI.logTime(submitData);
      }

      onSave(response.data.data);
      toast.success(timeLog ? 'Time log updated successfully!' : 'Time log created successfully!');
    } catch (error) {
      console.error('Error saving time log:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save time log';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        style={{ isolation: 'isolate' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {timeLog ? 'Edit Time Log' : 'Log Time'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`w-full pl-10 pr-4 py-3 h-[42px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.project_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.project_id && (
                <p className="mt-1 text-sm text-red-600">{errors.project_id}</p>
              )}
            </div>

            {/* Task */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task *
              </label>
              <div className="relative">
                <FiFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  name="task_id"
                  value={formData.task_id}
                  onChange={handleInputChange}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`w-full pl-10 pr-4 py-3 h-[42px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.task_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Task</option>
                  {filteredTasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
              {errors.task_id && (
                <p className="mt-1 text-sm text-red-600">{errors.task_id}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                rows={3}
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe what you worked on..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`w-full pl-10 pr-4 py-3 h-[42px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Hours Spent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hours Spent *
              </label>
              <div className="relative">
                <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="number"
                  name="hours_spent"
                  value={formData.hours_spent}
                  onChange={handleInputChange}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  step="0.25"
                  min="0"
                  className={`w-full pl-10 pr-4 py-3 h-[42px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.hours_spent ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter the number of hours worked (e.g., 2.5 for 2 hours 30 minutes)
              </p>
              {errors.hours_spent && (
                <p className="mt-1 text-sm text-red-600">{errors.hours_spent}</p>
              )}
            </div>

            {/* Billable */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_billable"
                checked={formData.is_billable}
                onChange={handleInputChange}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Billable time
              </label>
              <FiDollarSign className="ml-1 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (timeLog ? 'Update Log' : 'Log Time')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeLogModal; 