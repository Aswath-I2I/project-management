import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiClock, FiCalendar, FiUser, FiFilter, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { timeAPI, projectsAPI, tasksAPI } from '../services/api';
import TimeLogModal from '../components/time/TimeLogModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const TimeTracking = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeLogs, setTimeLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    project_id: '',
    task_id: '',
    search: ''
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch time logs
      const logsResponse = await timeAPI.getUserLogs(filters);
      setTimeLogs(logsResponse.data.data || []);

      // Fetch tasks for dropdown
      const tasksResponse = await tasksAPI.getAll();
      setTasks(tasksResponse.data.data || []);

      // Fetch projects for dropdown
      const projectsResponse = await projectsAPI.getAll();
      setProjects(projectsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching time tracking data:', error);
      toast.error('Failed to load time tracking data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = () => {
    setEditingLog(null);
    setShowAddLogModal(true);
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setShowAddLogModal(true);
  };

  const handleLogSaved = async (savedLog) => {
    setShowAddLogModal(false);
    setEditingLog(null);
    
    // Refresh data
    await fetchData();
    
    if (editingLog) {
      toast.success('Time log updated successfully!');
    } else {
      toast.success('Time log added successfully!');
    }
  };

  const handleDeleteLog = async (logId) => {
    setLogToDelete(logId);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!logToDelete) return;

    try {
      await timeAPI.deleteTime(logToDelete);
      setTimeLogs(prev => prev.filter(log => log.id !== logToDelete));
      toast.success('Time log deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete time log');
    } finally {
      setLogToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Calculate statistics
  const totalHours = timeLogs.reduce((sum, log) => sum + parseFloat(log.hours_spent), 0);
  const billableHours = timeLogs.filter(log => log.is_billable).reduce((sum, log) => sum + parseFloat(log.hours_spent), 0);
  const todayHours = timeLogs
    .filter(log => log.date === new Date().toISOString().split('T')[0])
    .reduce((sum, log) => sum + parseFloat(log.hours_spent), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading time tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
              <p className="text-gray-600 mt-2">Track your time and manage timesheets</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
              <button
                onClick={handleAddLog}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Log Time
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <FiClock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <FiClock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Billable Hours</p>
                <p className="text-2xl font-bold text-gray-900">{billableHours.toFixed(1)}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-lg">
                <FiCalendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Hours</p>
                <p className="text-2xl font-bold text-gray-900">{todayHours.toFixed(1)}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-orange-500 p-3 rounded-lg">
                <FiClock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{timeLogs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange({ start_date: e.target.value })}
                className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange({ end_date: e.target.value })}
                className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={filters.project_id || ''}
                onChange={(e) => handleFilterChange({ project_id: e.target.value })}
                className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
              <select
                value={filters.task_id || ''}
                onChange={(e) => handleFilterChange({ task_id: e.target.value })}
                className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tasks</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.date_range || ''}
                onChange={(e) => handleFilterChange({ date_range: e.target.value })}
                className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Time Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project/Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeLogs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{log.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {log.project_name || log.task_title || 'General'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.project_name && log.task_title ? log.task_title : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(log.hours_spent).toFixed(2)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.is_billable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {log.is_billable ? 'Billable' : 'Non-billable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditLog(log)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {timeLogs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">⏱️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No time logs found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.start_date || filters.end_date
                  ? 'Try adjusting your filters to see more time logs.'
                  : 'Get started by logging your first time entry.'}
              </p>
              {!filters.search && !filters.start_date && !filters.end_date && (
                <button
                  onClick={handleAddLog}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="mr-2" />
                  Log Time
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Time Log Modal */}
      <TimeLogModal
        isOpen={showAddLogModal}
        onClose={() => setShowAddLogModal(false)}
        timeLog={editingLog}
        onSave={handleLogSaved}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        itemName={logToDelete ? `Time log for ${new Date(timeLogs.find(log => log.id === logToDelete)?.date).toLocaleDateString()}` : ''}
      />
    </div>
  );
};

export default TimeTracking; 