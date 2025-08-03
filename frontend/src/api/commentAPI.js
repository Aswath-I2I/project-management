import api from './api';

const commentAPI = {
  // Get comments for a task
  getTaskComments: async (taskId, options = {}) => {
    const { page = 1, limit = 20 } = options;
    const response = await api.get(`/comments/task/${taskId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Get comments for a project
  getProjectComments: async (projectId, options = {}) => {
    const { page = 1, limit = 20 } = options;
    const response = await api.get(`/comments/project/${projectId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Create a comment
  createComment: async (commentData) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },

  // Update a comment
  updateComment: async (commentId, updateData) => {
    const response = await api.put(`/comments/${commentId}`, updateData);
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
};

export default commentAPI; 