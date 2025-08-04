import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiRefreshCw, FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { teamAPI, projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { canManageUsers, getRoleDisplayName, getRoleColor } from '../utils/permissions';
import UserModal from '../components/team/UserModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';

const Team = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    project_id: ''
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Prepare API parameters
      const apiParams = {
        search: filters.search || undefined,
        role: filters.role || undefined,
        is_active: filters.status === 'active' ? true : 
                   filters.status === 'inactive' ? false : undefined
      };

      // Fetch all users with filters
      const usersResponse = await teamAPI.getAllUsers(apiParams);
      
      // Handle both paginated and non-paginated responses
      const usersData = usersResponse.data.data || usersResponse.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);

      // Fetch projects for filtering
      const projectsResponse = await projectsAPI.getAll();
      setProjects(projectsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowAddUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddUserModal(true);
  };

  const handleUserSaved = async (savedUser) => {
    setShowAddUserModal(false);
    setEditingUser(null);
    
    // Refresh data
    await fetchData();
    
    if (editingUser) {
      toast.success('User updated successfully!');
    } else {
      toast.success('User added successfully!');
    }
  };

  const handleDeleteUser = async (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await teamAPI.deleteUser(userToDelete);
      setUsers(prev => prev.filter(u => u.id !== userToDelete));
      toast.success('User deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setShowDeleteConfirmation(false);
      setUserToDelete(null);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: '',
      project_id: ''
    });
  };

  // Filter users based on all filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !filters.search || 
      user.first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.username?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesRole = !filters.role || user.role === filters.role || 
      (user.global_roles && user.global_roles.includes(filters.role));
    
    const matchesStatus = !filters.status || 
      (filters.status === 'active' && user.is_active) ||
      (filters.status === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team data...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-2">Manage team members and their roles</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
              {canManageUsers(user) && (
                <button
                  onClick={handleAddUser}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FiUserPlus className="mr-2" />
                  Add User
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-lg">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Project Managers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'project_manager' || (u.global_roles && u.global_roles.includes('project_manager'))).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-orange-500 p-3 rounded-lg">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'team_member' || (u.global_roles && u.global_roles.includes('team_member'))).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filters.role || ''}
                onChange={(e) => handleFilterChange({ role: e.target.value })}
                className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="project_manager">Project Manager</option>
                <option value="developer">Developer</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={filters.project_id}
                onChange={(e) => handleFilterChange({ project_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar_url}
                              alt={`${user.first_name} ${user.last_name}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role || user.global_roles?.[0])}`}>
                        {getRoleDisplayName(user.role || user.global_roles?.[0])}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {canManageUsers(user) && (
                          <>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.role || filters.status
                  ? 'Try adjusting your filters to see more users.'
                  : 'Get started by adding your first team member.'}
              </p>
              {!filters.search && !filters.role && !filters.status && canManageUsers(user) && (
                <button
                  onClick={handleAddUser}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FiUserPlus className="mr-2" />
                  Add User
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <UserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        user={editingUser}
        onSave={handleUserSaved}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        itemName={userToDelete ? users.find(u => u.id === userToDelete)?.first_name : ''}
      />
    </div>
  );
};

export default Team; 