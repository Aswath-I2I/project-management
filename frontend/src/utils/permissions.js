// Permission utility functions

// Check if user is super admin
export const isSuperAdmin = (userRole, globalRoles = []) => {
  return userRole === 'admin' || globalRoles.includes('admin');
};

// Super admin has access to everything
export const canAddTeamMembers = (userRole, globalRoles = []) => {
  if (isSuperAdmin(userRole, globalRoles)) return true;
  return ['project_manager', 'admin', 'team_lead'].includes(userRole);
};

export const canEditProject = (userRole, globalRoles = []) => {
  if (isSuperAdmin(userRole, globalRoles)) return true;
  return ['project_manager', 'admin'].includes(userRole);
};

export const canDeleteProject = (userRole, globalRoles = []) => {
  if (isSuperAdmin(userRole, globalRoles)) return true;
  return ['admin'].includes(userRole);
};

export const canManageMilestones = (userRole, globalRoles = []) => {
  if (isSuperAdmin(userRole, globalRoles)) return true;
  return ['project_manager', 'admin', 'team_lead'].includes(userRole);
};

export const canAssignTasks = (userRole, globalRoles = []) => {
  if (isSuperAdmin(userRole, globalRoles)) return true;
  return ['project_manager', 'admin', 'team_lead'].includes(userRole);
};

export const canViewAllTasks = (userRole, globalRoles = []) => {
  if (isSuperAdmin(userRole, globalRoles)) return true;
  return ['project_manager', 'admin', 'team_lead', 'developer'].includes(userRole);
};

export const canManageUsers = (userRole, globalRoles = []) => {
  if (isSuperAdmin(userRole, globalRoles)) return true;
  return ['admin'].includes(userRole);
};

export const canManageSystem = (userRole, globalRoles = []) => {
  if (isSuperAdmin(userRole, globalRoles)) return true;
  return ['admin'].includes(userRole);
};

export const canAccessAllProjects = (userRole, globalRoles = []) => {
  if (isSuperAdmin(userRole, globalRoles)) return true;
  return ['admin', 'project_manager'].includes(userRole);
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    'admin': 'Administrator',
    'super_admin': 'Super Administrator',
    'project_manager': 'Project Manager',
    'team_lead': 'Team Lead',
    'developer': 'Developer',
    'designer': 'Designer',
    'tester': 'Tester',
    'analyst': 'Analyst',
    'member': 'Member',
    'viewer': 'Viewer'
  };
  return roleNames[role] || role;
};

export const getRoleColor = (role) => {
  const roleColors = {
    'admin': 'bg-red-100 text-red-800',
    'super_admin': 'bg-red-200 text-red-900 font-bold',
    'project_manager': 'bg-purple-100 text-purple-800',
    'team_lead': 'bg-blue-100 text-blue-800',
    'developer': 'bg-green-100 text-green-800',
    'designer': 'bg-pink-100 text-pink-800',
    'tester': 'bg-yellow-100 text-yellow-800',
    'analyst': 'bg-indigo-100 text-indigo-800',
    'member': 'bg-gray-100 text-gray-800',
    'viewer': 'bg-gray-100 text-gray-600'
  };
  return roleColors[role] || 'bg-gray-100 text-gray-800';
}; 