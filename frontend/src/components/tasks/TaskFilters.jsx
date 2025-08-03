import React, { useState } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const TaskFilters = ({ filters, projects, users, onFilterChange, onSearch }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFilterChange({
      project_id: '',
      assigned_to: '',
      status: '',
      priority: '',
      search: ''
    });
  };

  const hasActiveFilters = filters.project_id || filters.assigned_to || filters.status || filters.priority || filters.search;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="w-full pl-10 pr-4 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-3 py-2 rounded-md transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FiFilter className="mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-1">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiX className="mr-1" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  value={filters.project_id || ''}
                  onChange={(e) => handleFilterChange('project_id', e.target.value)}
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

              {/* Assignee Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee
                </label>
                <select
                  value={filters.assigned_to || ''}
                  onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
                  className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Assignees</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {filters.project_id && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Project: {projects.find(p => p.id === filters.project_id)?.name}
                      <button
                        onClick={() => handleFilterChange('project_id', '')}
                        className="ml-1 hover:text-blue-600"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  
                  {filters.assigned_to && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Assignee: {filters.assigned_to === 'unassigned' ? 'Unassigned' : users.find(u => u.id === filters.assigned_to)?.first_name}
                      <button
                        onClick={() => handleFilterChange('assigned_to', '')}
                        className="ml-1 hover:text-green-600"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  
                  {filters.status && (
                    <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Status: {filters.status.replace('_', ' ')}
                      <button
                        onClick={() => handleFilterChange('status', '')}
                        className="ml-1 hover:text-yellow-600"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  
                  {filters.priority && (
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Priority: {filters.priority}
                      <button
                        onClick={() => handleFilterChange('priority', '')}
                        className="ml-1 hover:text-purple-600"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  
                  {filters.search && (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Search: "{filters.search}"
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          onSearch('');
                        }}
                        className="ml-1 hover:text-gray-600"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskFilters; 