import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     console.error('API Error:', error.response?.status, error.response?.data);
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  uploadAvatar: (formData) => api.post('/auth/upload-avatar', formData),
  logout: () => api.post('/auth/logout')
};

// Projects API
export const projectsAPI = {
  getAll: (params = {}) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: (id) => api.get(`/projects/${id}/stats`),
};

// Milestones API
export const milestonesAPI = {
  getByProject: (projectId, params = {}) => 
    api.get(`/milestones/project/${projectId}`, { params }),
  getById: (id) => api.get(`/milestones/${id}`),
  create: (milestoneData) => api.post('/milestones', milestoneData),
  update: (id, milestoneData) => api.put(`/milestones/${id}`, milestoneData),
  updateStatus: (id, status) => api.patch(`/milestones/${id}/status`, { status }),
  delete: (id) => api.delete(`/milestones/${id}`),
  getStats: (id) => api.get(`/milestones/${id}/stats`),
  getOverdue: () => api.get('/milestones/overdue'),
  getUpcoming: (days = 7) => api.get('/milestones/upcoming', { params: { days } }),
};

// Tasks API
export const tasksAPI = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getByProject: (projectId, params = {}) => 
    api.get(`/tasks/project/${projectId}`, { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  assign: (id, userId) => {
    return api.patch(`/tasks/${id}/assign`, { assigned_to: userId });
  },
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  updateProgress: (id, progress) => api.patch(`/tasks/${id}/progress`, { progress_percentage: progress }),
  delete: (id) => api.delete(`/tasks/${id}`),
  getAssigned: (params = {}) => api.get('/tasks/user/assigned', { params }),
  getOverdue: () => api.get('/tasks/overdue'),
};

// Team API functions
export const teamAPI = {
  getAllUsers: (params = {}) => api.get('/team/users', { params }),
  getAssignableUsers: (projectId = null) => api.get('/team/assignable-users', { params: projectId ? { project_id: projectId } : {} }),
  getUserById: (id) => api.get(`/team/users/${id}`),
  getProjectTeam: (projectId) => api.get(`/team/project/${projectId}`),
  addToProject: (projectId, memberData) => api.post(`/team/project/${projectId}/members`, memberData),
  updateRole: (projectId, userId, role) => api.put(`/team/project/${projectId}/members/${userId}/role`, { role }),
  removeFromProject: (projectId, userId) => api.delete(`/team/project/${projectId}/members/${userId}`),
  getUserProjects: () => api.get('/team/user/projects'),
  getUserAssignedTasks: (params) => api.get('/team/user/assigned-tasks', { params }),
  getUserStats: () => api.get('/team/user/stats'),
  getCurrentUserRole: (projectId) => api.get(`/team/project/${projectId}/current-user-role`),
  // User management methods
  createUser: (userData) => api.post('/team/users', userData),
  updateUser: (id, userData) => api.put(`/team/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/team/users/${id}`),
  updateUserRole: (id, roleData) => api.patch(`/team/users/${id}/role`, roleData),
  updateUserStatus: (id, statusData) => api.patch(`/team/users/${id}/status`, statusData)
};

// Comments API
export const commentsAPI = {
  getByTask: (taskId, params = {}) => 
    api.get(`/comments/task/${taskId}`, { params }),
  getByProject: (projectId, params = {}) => 
    api.get(`/comments/project/${projectId}`, { params }),
  getById: (id) => api.get(`/comments/${id}`),
  create: (commentData) => api.post('/comments', commentData),
  update: (id, commentData) => api.put(`/comments/${id}`, commentData),
  delete: (id) => api.delete(`/comments/${id}`),
};

// Time Tracking API
export const timeAPI = {
  logTime: (timeData) => api.post('/time/log', timeData),
  updateTime: (id, timeData) => api.put(`/time/${id}`, timeData),
  deleteTime: (id) => api.delete(`/time/${id}`),
  getByTask: (taskId, params = {}) => 
    api.get(`/time/task/${taskId}`, { params }),
  getByProject: (projectId, params = {}) => 
    api.get(`/time/project/${projectId}`, { params }),
  getUserLogs: (params = {}) => api.get('/time/user/assigned', { params }),
  getProjectSummary: (projectId, params = {}) => 
    api.get(`/time/project/${projectId}/summary`, { params }),
  getUserTimesheet: (params = {}) => api.get('/time/user/timesheet', { params }),
};

// File Upload API
export const uploadAPI = {
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};

// Health Check API
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 