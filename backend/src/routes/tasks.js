const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// Validation middleware
const validateTask = [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Task title is required and must be less than 255 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'completed', 'closed', 'cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('type').optional().isIn(['task', 'bug', 'feature', 'story']).withMessage('Invalid task type'),
  body('estimated_hours').optional().isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
  body('actual_hours').optional().isFloat({ min: 0 }).withMessage('Actual hours must be a positive number'),
  body('progress_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Progress percentage must be between 0 and 100'),
  body('due_date').optional().isISO8601().withMessage('Invalid due date format')
];

const validateTaskUpdate = [
  body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Task title must be less than 255 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'completed', 'closed', 'cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('type').optional().isIn(['task', 'bug', 'feature', 'story']).withMessage('Invalid task type'),
  body('estimated_hours').optional().isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
  body('actual_hours').optional().isFloat({ min: 0 }).withMessage('Actual hours must be a positive number'),
  body('progress_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Progress percentage must be between 0 and 100'),
  body('due_date').optional().isISO8601().withMessage('Invalid due date format')
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

// GET /api/tasks - Get all tasks user has access to
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, project_id, status, priority, assigned_to, search } = req.query;
    const result = await taskController.getAllUserTasks(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      project_id,
      status,
      priority,
      assigned_to,
      search
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
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// GET /api/tasks/project/:projectId - Get all tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, assigned_to, milestone_id, search } = req.query;
    const result = await taskController.getProjectTasks(req.params.projectId, req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      priority,
      assigned_to,
      milestone_id,
      search
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
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await taskController.getTaskById(req.params.id, req.user.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
});

// POST /api/tasks - Create new task
router.post('/', auth, validateTask, handleValidationErrors, async (req, res) => {
  try {
    const task = await taskController.createTask(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', auth, validateTaskUpdate, handleValidationErrors, async (req, res) => {
  try {
    const task = await taskController.updateTask(req.params.id, req.body, req.user.id);
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// PATCH /api/tasks/:id/assign - Assign task to user
router.patch('/:id/assign', auth, [
  body('assigned_to')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) {
        return true; // Allow null/undefined for unassignment
      }
      if (typeof value === 'string' && value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return true; // Valid UUID
      }
      throw new Error('assigned_to must be null (for unassignment) or a valid UUID');
    })
], handleValidationErrors, async (req, res) => {
  try {
    const task = await taskController.assignTask(req.params.id, req.body.assigned_to, req.user.id);
    
    res.json({
      success: true,
      message: 'Task assigned successfully',
      data: task
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Failed to assign task',
      error: error.message
    });
  }
});

// PATCH /api/tasks/:id/status - Update task status
router.patch('/:id/status', auth, [
  body('status').isIn(['todo', 'in_progress', 'review', 'completed', 'closed', 'cancelled']).withMessage('Invalid status')
], handleValidationErrors, async (req, res) => {
  try {
    console.log('🔍 Status update request:', {
      taskId: req.params.id,
      status: req.body.status,
      userId: req.user.id,
      body: req.body
    });
    
    const task = await taskController.updateTaskStatus(req.params.id, req.body.status, req.user.id);
    
    console.log('✅ Status update successful:', task.status);
    
    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    console.log('❌ Status update error:', error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
});

// PATCH /api/tasks/:id/progress - Update task progress
router.patch('/:id/progress', auth, [
  body('progress_percentage').isInt({ min: 0, max: 100 }).withMessage('Progress percentage must be between 0 and 100')
], handleValidationErrors, async (req, res) => {
  try {
    const task = await taskController.updateTaskProgress(req.params.id, req.body.progress_percentage, req.user.id);
    
    res.json({
      success: true,
      message: 'Task progress updated successfully',
      data: task
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Failed to update task progress',
      error: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await taskController.deleteTask(req.params.id, req.user.id);
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

// GET /api/tasks/user/assigned - Get user's assigned tasks
router.get('/user/assigned', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, project_id, status, priority } = req.query;
    const result = await taskController.getUserTasks(req.user.id, {
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

// GET /api/tasks/overdue - Get overdue tasks for current user
router.get('/overdue', auth, async (req, res) => {
  try {
    const tasks = await taskController.getOverdueTasks(req.user.id);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue tasks',
      error: error.message
    });
  }
});

module.exports = router; 