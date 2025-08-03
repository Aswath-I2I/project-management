const { pool } = require('../config/database');

class CommentController {
  // Get comments for a task
  async getTaskComments(taskId, userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Check if user has access to this task
    const taskQuery = await pool.query(
      'SELECT project_id FROM tasks WHERE id = $1',
      [taskId]
    );
    if (taskQuery.rows.length === 0) {
      throw new Error('Task not found');
    }

    const accessCheck = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [taskQuery.rows[0].project_id, userId]
    );
    if (accessCheck.rows.length === 0) {
      throw new Error('Access denied to this task');
    }

    // Count total comments
    const countQuery = `
      SELECT COUNT(*) as total
      FROM comments
      WHERE task_id = $1
    `;
    const countResult = await pool.query(countQuery, [taskId]);
    const totalItems = parseInt(countResult.rows[0].total);

    // Get comments with user information
    const commentsQuery = `
      SELECT 
        c.*,
        u.first_name,
        u.last_name,
        u.username,
        u.avatar_url,
        COUNT(replies.id) as replies_count
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN comments replies ON c.id = replies.parent_comment_id
      WHERE c.task_id = $1 AND c.parent_comment_id IS NULL
      GROUP BY c.id, u.first_name, u.last_name, u.username, u.avatar_url
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const commentsResult = await pool.query(commentsQuery, [taskId, limit, offset]);
    const comments = commentsResult.rows;

    // Get replies for each comment
    for (let comment of comments) {
      const repliesQuery = `
        SELECT 
          r.*,
          u.first_name,
          u.last_name,
          u.username,
          u.avatar_url
        FROM comments r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.parent_comment_id = $1
        ORDER BY r.created_at ASC
      `;
      const repliesResult = await pool.query(repliesQuery, [comment.id]);
      comment.replies = repliesResult.rows;
    }

    return {
      comments,
      pagination: {
        page,
        limit,
        total: totalItems,
        pages: Math.ceil(totalItems / limit)
      }
    };
  }

  // Get comments for a project
  async getProjectComments(projectId, userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Check if user has access to this project
    const accessCheck = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (accessCheck.rows.length === 0) {
      throw new Error('Access denied to this project');
    }

    // Count total comments
    const countQuery = `
      SELECT COUNT(*) as total
      FROM comments
      WHERE project_id = $1
    `;
    const countResult = await pool.query(countQuery, [projectId]);
    const totalItems = parseInt(countResult.rows[0].total);

    // Get comments with user information
    const commentsQuery = `
      SELECT 
        c.*,
        u.first_name,
        u.last_name,
        u.username,
        u.avatar_url,
        COUNT(replies.id) as replies_count
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN comments replies ON c.id = replies.parent_comment_id
      WHERE c.project_id = $1 AND c.parent_comment_id IS NULL
      GROUP BY c.id, u.first_name, u.last_name, u.username, u.avatar_url
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const commentsResult = await pool.query(commentsQuery, [projectId, limit, offset]);
    const comments = commentsResult.rows;

    // Get replies for each comment
    for (let comment of comments) {
      const repliesQuery = `
        SELECT 
          r.*,
          u.first_name,
          u.last_name,
          u.username,
          u.avatar_url
        FROM comments r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.parent_comment_id = $1
        ORDER BY r.created_at ASC
      `;
      const repliesResult = await pool.query(repliesQuery, [comment.id]);
      comment.replies = repliesResult.rows;
    }

    return {
      comments,
      pagination: {
        page,
        limit,
        total: totalItems,
        pages: Math.ceil(totalItems / limit)
      }
    };
  }

  // Create a comment
  async createComment(commentData, userId) {
    const { content, task_id, project_id, milestone_id, parent_comment_id } = commentData;

    if (!content || content.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    // Validate that at least one entity is specified
    if (!task_id && !project_id && !milestone_id) {
      throw new Error('Comment must be associated with a task, project, or milestone');
    }

    // Check access based on the entity type
    if (task_id) {
      const taskQuery = await pool.query(
        'SELECT project_id FROM tasks WHERE id = $1',
        [task_id]
      );
      if (taskQuery.rows.length === 0) {
        throw new Error('Task not found');
      }

      const accessCheck = await pool.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
        [taskQuery.rows[0].project_id, userId]
      );
      if (accessCheck.rows.length === 0) {
        throw new Error('Access denied to this task');
      }
    } else if (project_id) {
      const accessCheck = await pool.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
        [project_id, userId]
      );
      if (accessCheck.rows.length === 0) {
        throw new Error('Access denied to this project');
      }
    } else if (milestone_id) {
      const milestoneQuery = await pool.query(
        'SELECT project_id FROM milestones WHERE id = $1',
        [milestone_id]
      );
      if (milestoneQuery.rows.length === 0) {
        throw new Error('Milestone not found');
      }

      const accessCheck = await pool.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
        [milestoneQuery.rows[0].project_id, userId]
      );
      if (accessCheck.rows.length === 0) {
        throw new Error('Access denied to this milestone');
      }
    }

    // If this is a reply, validate parent comment exists and user has access
    if (parent_comment_id) {
      const parentQuery = await pool.query(
        'SELECT task_id, project_id, milestone_id FROM comments WHERE id = $1',
        [parent_comment_id]
      );
      if (parentQuery.rows.length === 0) {
        throw new Error('Parent comment not found');
      }

      const parent = parentQuery.rows[0];
      if (parent.task_id && parent.task_id !== task_id) {
        throw new Error('Reply must be on the same task as parent comment');
      }
      if (parent.project_id && parent.project_id !== project_id) {
        throw new Error('Reply must be on the same project as parent comment');
      }
      if (parent.milestone_id && parent.milestone_id !== milestone_id) {
        throw new Error('Reply must be on the same milestone as parent comment');
      }
    }

    const result = await pool.query(
      `INSERT INTO comments (user_id, task_id, project_id, milestone_id, parent_comment_id, content)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, task_id, project_id, milestone_id, parent_comment_id, content.trim()]
    );

    // Get the created comment with user information
    const commentQuery = `
      SELECT 
        c.*,
        u.first_name,
        u.last_name,
        u.username,
        u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const commentResult = await pool.query(commentQuery, [result.rows[0].id]);

    return commentResult.rows[0];
  }

  // Update a comment
  async updateComment(commentId, updateData, userId) {
    const { content } = updateData;

    if (!content || content.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    // Get comment and check ownership
    const commentQuery = await pool.query(
      'SELECT user_id, task_id, project_id, milestone_id FROM comments WHERE id = $1',
      [commentId]
    );

    if (commentQuery.rows.length === 0) {
      throw new Error('Comment not found');
    }

    const comment = commentQuery.rows[0];

    // Check if user owns the comment or has admin privileges
    if (comment.user_id !== userId) {
      let projectId = comment.project_id;
      if (comment.task_id) {
        const taskQuery = await pool.query(
          'SELECT project_id FROM tasks WHERE id = $1',
          [comment.task_id]
        );
        projectId = taskQuery.rows[0].project_id;
      } else if (comment.milestone_id) {
        const milestoneQuery = await pool.query(
          'SELECT project_id FROM milestones WHERE id = $1',
          [comment.milestone_id]
        );
        projectId = milestoneQuery.rows[0].project_id;
      }

      const accessCheck = await pool.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );
      if (accessCheck.rows.length === 0 || !['project_manager', 'admin'].includes(accessCheck.rows[0].role)) {
        throw new Error('Insufficient permissions to edit this comment');
      }
    }

    const result = await pool.query(
      `UPDATE comments 
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [content.trim(), commentId]
    );

    // Get the updated comment with user information
    const updatedCommentQuery = `
      SELECT 
        c.*,
        u.first_name,
        u.last_name,
        u.username,
        u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const updatedCommentResult = await pool.query(updatedCommentQuery, [commentId]);

    return updatedCommentResult.rows[0];
  }

  // Delete a comment
  async deleteComment(commentId, userId) {
    // Get comment and check ownership
    const commentQuery = await pool.query(
      'SELECT user_id, task_id, project_id, milestone_id FROM comments WHERE id = $1',
      [commentId]
    );

    if (commentQuery.rows.length === 0) {
      throw new Error('Comment not found');
    }

    const comment = commentQuery.rows[0];

    // Check if user owns the comment or has admin privileges
    if (comment.user_id !== userId) {
      let projectId = comment.project_id;
      if (comment.task_id) {
        const taskQuery = await pool.query(
          'SELECT project_id FROM tasks WHERE id = $1',
          [comment.task_id]
        );
        projectId = taskQuery.rows[0].project_id;
      } else if (comment.milestone_id) {
        const milestoneQuery = await pool.query(
          'SELECT project_id FROM milestones WHERE id = $1',
          [comment.milestone_id]
        );
        projectId = milestoneQuery.rows[0].project_id;
      }

      const accessCheck = await pool.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );
      if (accessCheck.rows.length === 0 || !['project_manager', 'admin'].includes(accessCheck.rows[0].role)) {
        throw new Error('Insufficient permissions to delete this comment');
      }
    }

    // Delete the comment (replies will be deleted due to CASCADE)
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 RETURNING id',
      [commentId]
    );

    return { id: commentId };
  }
}

module.exports = new CommentController(); 