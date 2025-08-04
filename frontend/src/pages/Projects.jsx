import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiUsers, FiCalendar, FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle   } from 'react-icons/fi';
import { projectsAPI } from '../services/api';
import ProjectModal from '../components/projects/ProjectModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Check if token exists
      const token = localStorage.getItem('token');
      
      const response = await projectsAPI.getAll();
      setProjects(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch projects: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleModalSuccess = (project) => {
    fetchProjects(); // Refresh the list
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await projectsAPI.delete(projectToDelete.id);
      toast.success('Project deleted successfully!');
      fetchProjects(); // Refresh the list
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete project';
      toast.error(errorMessage);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Function to validate and clamp progress percentage between 0 and 100
  const getValidProgressPercentage = (percentage) => {
    const progress = percentage || 0;
    return Math.min(Math.max(progress, 0), 100);
  };

  const isOverdue = (endDate) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" 
            onClick={handleCreateProject}
          > 
            <FiPlus className="mr-2" /> Add Project 
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading projects...</div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-12">{error}</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg mb-4">No projects found.</div>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={handleCreateProject}
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <h3 
                      className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      {project.name}
                    </h3>
                    {isOverdue(project.end_date) && project.status !== 'completed' && (
                      <FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {project.description || 'No description available'}
                  </p>

                  {/* Status and Priority Badges */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`badge ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className={`badge ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{getValidProgressPercentage(project.progress_percentage)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${getProgressColor(getValidProgressPercentage(project.progress_percentage))}`}
                        style={{ width: `${getValidProgressPercentage(project.progress_percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiUsers className="h-4 w-4 mr-2" />
                      <span>{project.team_members_count || 0} members</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCheckCircle className="h-4 w-4 mr-2" />
                      <span>{project.completed_tasks_count || 0}/{project.tasks_count || 0} tasks</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="h-4 w-4 mr-2" />
                      <span>Due {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No due date'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiClock className="h-4 w-4 mr-2" />
                      <span>{project.total_hours || 0}h</span>
                    </div>
                  </div>

                  {/* Budget (if available) */}
                  {project.budget && (
                    <div className="mb-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Budget</span>
                        <span className="font-medium text-gray-900">
                          ${project.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FiEye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        title="Edit Project"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Project"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={editingProject}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={projectToDelete?.name || ''}
      />
    </div>
  );
};

export default Projects; 