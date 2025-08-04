import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { tasksAPI, projectsAPI, teamAPI } from '../services/api';
import toast from 'react-hot-toast';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskStats from '../components/tasks/TaskStats';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    project_id: '',
    assigned_to: '',
    status: '',
    priority: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    in_progress: 0,
    overdue: 0
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all tasks the user has access to (not just assigned)
      const tasksResponse = await tasksAPI.getAll(filters);
      setTasks(tasksResponse.data.data || []);

      // Fetch projects for filter dropdown
      const projectsResponse = await projectsAPI.getAll();
      setProjects(projectsResponse.data.data || []);

      // Fetch assignable users for assignment dropdown
      const usersResponse = await teamAPI.getAssignableUsers();
      setUsers(usersResponse.data.data || []);

      // Calculate stats
      calculateStats(tasksResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (taskList) => {
    const stats = {
      total: taskList.length,
      completed: taskList.filter(task => task.status === 'completed').length,
      in_progress: taskList.filter(task => task.status === 'in_progress').length,
      overdue: taskList.filter(task => new Date(task.due_date) < new Date() && task.status !== 'completed').length
    };
    setStats(stats);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSaved = async (savedTask) => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    
    // Refresh data from server to ensure we have the latest data
    await fetchData();
    
    if (editingTask) {
      toast.success('Task updated successfully!');
    } else {
      toast.success('Task created successfully!');
    }
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success('Task deleted successfully!');
    calculateStats(tasks.filter(task => task.id !== taskId));
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await tasksAPI.updateStatus(taskId, newStatus);
      const updatedTask = response.data.data;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      toast.success('Task status updated!');
      calculateStats(tasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleProgressUpdate = async (taskId, newProgress) => {
    try {
      const response = await tasksAPI.updateProgress(taskId, newProgress);
      const updatedTask = response.data.data;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      toast.success('Task progress updated!');
    } catch (error) {
      toast.error('Failed to update task progress');
    }
  };

  const handleAssignTask = async (taskId, userId) => {
    try {
      const response = await tasksAPI.assign(taskId, userId);
      const updatedTask = response.data.data;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      toast.success('Task assigned successfully!');
    } catch (error) {
      console.error('Assignment error:', error.response?.data || error.message);
      toast.error('Failed to assign task');
    }
  };

  const handlePriorityUpdate = async (taskId, newPriority) => {
    try {
      const response = await tasksAPI.update(taskId, { priority: newPriority });
      const updatedTask = response.data.data;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      toast.success('Task priority updated!');
    } catch (error) {
      toast.error('Failed to update task priority');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-600 mt-2">Manage and track your assigned tasks</p>
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
                onClick={handleCreateTask}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Create Task
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <TaskStats stats={stats} />

        {/* Filters */}
        <TaskFilters
          filters={filters}
          projects={projects}
          users={users}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {/* Tasks Grid */}
        <div className="mt-6">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.status || filters.priority || filters.project_id
                  ? 'Try adjusting your filters to see more tasks.'
                  : 'Get started by creating your first task.'}
              </p>
              {!filters.search && !filters.status && !filters.priority && !filters.project_id && (
                <button
                  onClick={handleCreateTask}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="mr-2" />
                  Create Task
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleTaskDeleted}
                  onStatusUpdate={handleStatusUpdate}
                  onProgressUpdate={handleProgressUpdate}
                  onPriorityUpdate={handlePriorityUpdate}
                  onAssign={handleAssignTask}
                  users={users}
                />
              ))}
            </div>
          )}
        </div>

        {/* Task Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          task={editingTask}
          projects={projects}
          users={users}
          onSave={handleTaskSaved}
        />
      </div>
    </div>
  );
};

export default Tasks; 