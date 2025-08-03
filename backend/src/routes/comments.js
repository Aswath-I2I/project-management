const express = require('express');
const { body, param, query } = require('express-validator');
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Get comments for a task
router.get('/task/:taskId', [
  param('taskId').isUUID().withMessage('Invalid task ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
], async (req, res) => {
  try {
    const { taskId } = req.params;
    const { page, limit } = req.query;
    const userId = req.user.id;

    const result = await commentController.getTaskComments(taskId, userId, { page, limit });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get comments for a project
router.get('/project/:projectId', [
  param('projectId').isUUID().withMessage('Invalid project ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
], async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page, limit } = req.query;
    const userId = req.user.id;

    const result = await commentController.getProjectComments(projectId, userId, { page, limit });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Create a comment
router.post('/', [
  body('content').trim().notEmpty().withMessage('Comment content is required')
    .isLength({ max: 2000 }).withMessage('Comment content must be less than 2000 characters'),
  body('task_id').optional().isUUID().withMessage('Invalid task ID'),
  body('project_id').optional().isUUID().withMessage('Invalid project ID'),
  body('milestone_id').optional().isUUID().withMessage('Invalid milestone ID'),
  body('parent_comment_id').optional().isUUID().withMessage('Invalid parent comment ID'),
  validate
], async (req, res) => {
  try {
    const commentData = req.body;
    const userId = req.user.id;

    // Ensure only one entity is specified
    const entityCount = [commentData.task_id, commentData.project_id, commentData.milestone_id]
      .filter(Boolean).length;
    
    if (entityCount !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be associated with exactly one entity (task, project, or milestone)'
      });
    }

    const comment = await commentController.createComment(commentData, userId);
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update a comment
router.put('/:commentId', [
  param('commentId').isUUID().withMessage('Invalid comment ID'),
  body('content').trim().notEmpty().withMessage('Comment content is required')
    .isLength({ max: 2000 }).withMessage('Comment content must be less than 2000 characters'),
  validate
], async (req, res) => {
  try {
    const { commentId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const comment = await commentController.updateComment(commentId, updateData, userId);
    
    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a comment
router.delete('/:commentId', [
  param('commentId').isUUID().withMessage('Invalid comment ID'),
  validate
], async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    await commentController.deleteComment(commentId, userId);
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 