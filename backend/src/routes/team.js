const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const teamController = require('../controllers/teamController');
const { pool } = require('../config/database');

// Validation middleware
const validateAddMember = [
  body('user_id').isUUID().withMessage('Valid user ID is required'),
  body('role').optional().isIn(['member', 'developer', 'project_manager', 'viewer']).withMessage('Invalid role')
];

const validateUpdateRole = [
  body('role').isIn(['member', 'developer', 'project_manager', 'viewer']).withMessage('Invalid role')
];

// Check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/team/assignable-users - Get users that can be assigned tasks (users in accessible projects)
router.get('/assignable-users', auth, async (req, res) => {
  try {
    const { project_id } = req.query;
    const users = await teamController.getAssignableUsers(req.user.id, project_id);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignable users',
      error: error.message
    });
  }
});

// GET /api/team/users - Get all users
router.get('/users', auth, async (req, res) => {
  try {
    console.log('🔍 GET /api/team/users called');
    console.log('User ID from auth:', req.user.id);
    console.log('Query params:', req.query);
    
    const { page = 1, limit = 20, search, is_active, role } = req.query;
    console.log('Parsed params:', { page, limit, search, is_active, role });
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      role
    };
    
    // Only add is_active if it's provided in the query
    if (is_active !== undefined) {
      options.is_active = is_active === 'true';
    }
    
    const result = await teamController.getAllUsers(options);
    
    console.log('Controller result:', {
      usersCount: result.users.length,
      totalItems: result.totalItems,
      currentPage: result.currentPage,
      totalPages: result.totalPages
    });
    
    res.json({
      success: true,
      data: result.users,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    console.error('Error in GET /api/team/users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// GET /api/team/users/:id - Get user by ID
router.get('/users/:id', auth, async (req, res) => {
  try {
    const user = await teamController.getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// GET /api/team/project/:projectId/current-user-role - Get current user's role in project
router.get('/project/:projectId/current-user-role', auth, async (req, res) => {
  try {
    const result = await teamController.getCurrentUserRole(req.params.projectId, req.user.id);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user role',
      error: error.message
    });
  }
});

// GET /api/team/project/:projectId - Get project team members
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const team = await teamController.getProjectTeam(req.params.projectId, req.user.id);
    
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project team',
      error: error.message
    });
  }
});

// POST /api/team/project/:projectId/members - Add user to project
router.post('/project/:projectId/members', auth, validateAddMember, handleValidationErrors, async (req, res) => {
  try {
    const { user_id, role = 'member' } = req.body;
    const member = await teamController.addUserToProject(req.params.projectId, req.user.id, user_id, role);
    
    res.status(201).json({
      success: true,
      message: 'User added to project successfully',
      data: member
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add user to project',
      error: error.message
    });
  }
});

// PUT /api/team/project/:projectId/members/:userId/role - Update project member role
router.put('/project/:projectId/members/:userId/role', auth, validateUpdateRole, handleValidationErrors, async (req, res) => {
  try {
    const member = await teamController.updateProjectMemberRole(req.params.projectId, req.user.id, req.params.userId, req.body.role);
    
    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: member
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update member role',
      error: error.message
    });
  }
});

// DELETE /api/team/project/:projectId/members/:userId - Remove user from project
router.delete('/project/:projectId/members/:userId', auth, async (req, res) => {
  try {
    await teamController.removeUserFromProject(req.params.projectId, req.user.id, req.params.userId);
    
    res.json({
      success: true,
      message: 'User removed from project successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to remove user from project',
      error: error.message
    });
  }
});

// GET /api/team/user/projects - Get user's projects
router.get('/user/projects', auth, async (req, res) => {
  try {
    const projects = await teamController.getUserProjects(req.user.id);
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user projects',
      error: error.message
    });
  }
});

// GET /api/team/user/assigned-tasks - Get user's assigned tasks
router.get('/user/assigned-tasks', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, project_id, status, priority } = req.query;
    const result = await teamController.getUserAssignedTasks(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      project_id,
      status,
      priority
    });
    
    res.json({
      success: true,
      data: result.tasks,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned tasks',
      error: error.message
    });
  }
});

// GET /api/team/user/stats - Get user statistics
router.get('/user/stats', auth, async (req, res) => {
  try {
    const stats = await teamController.getUserStats(req.user.id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

// Validation for user management
const validateCreateUser = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'project_manager', 'team_member']).withMessage('Invalid role'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];

const validateUpdateUser = [
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'project_manager', 'team_member']).withMessage('Invalid role'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];

// POST /api/team/users - Create new user (admin only)
router.post('/users', auth, validateCreateUser, handleValidationErrors, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create users'
      });
    }

    const user = await teamController.createUser(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// PUT /api/team/users/:id - Update user (admin only)
router.put('/users/:id', auth, validateUpdateUser, handleValidationErrors, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update users'
      });
    }

    const user = await teamController.updateUser(req.params.id, req.body);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// DELETE /api/team/users/:id - Delete user (admin only)
router.delete('/users/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete users'
      });
    }

    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const deleted = await teamController.deleteUser(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// PATCH /api/team/users/:id/role - Update user role (admin only)
router.patch('/users/:id/role', auth, validateUpdateRole, handleValidationErrors, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update user roles'
      });
    }

    const user = await teamController.updateUserRole(req.params.id, req.body.role);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

// PATCH /api/team/users/:id/status - Update user status (admin only)
router.patch('/users/:id/status', auth, [
  body('is_active').isBoolean().withMessage('is_active must be a boolean')
], handleValidationErrors, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update user status'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id && !req.body.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await teamController.updateUserStatus(req.params.id, req.body.is_active);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User status updated successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

module.exports = router; 