const { pool } = require('../config/database');

class TaskController {
  // Get all tasks for a project with filtering
  async getProjectTasks(projectId, userId, options = {}) {
    const { status, priority, assigned_to, milestone_id, search, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Check if user has access to this project
    const accessCheck = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (accessCheck.rows.length === 0) {
      throw new Error('Access denied to this project');
    }

    let whereConditions = ['t.project_id = $1'];
    let queryParams = [projectId];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`t.status = $${++paramCount}`);
      queryParams.push(status);
    }

    if (priority) {
      whereConditions.push(`t.priority = $${++paramCount}`);
      queryParams.push(priority);
    }

    if (assigned_to) {
      whereConditions.push(`t.assigned_to = $${++paramCount}`);
      queryParams.push(assigned_to);
    }

    if (milestone_id) {
      whereConditions.push(`t.milestone_id = $${++paramCount}`);
      queryParams.push(milestone_id);
    }

    if (search) {
      whereConditions.push(`(t.title ILIKE $${++paramCount} OR t.description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Count total tasks
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tasks t
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].total);

    // Get tasks with related data
    const tasksQuery = `
      SELECT 
        t.*,
        u1.first_name as assigned_first_name,
        u1.last_name as assigned_last_name,
        u1.username as assigned_username,
        u1.avatar_url as assigned_avatar,
        u2.first_name as creator_first_name,
        u2.last_name as creator_last_name,
        u2.username as creator_username,
        m.name as milestone_name,
        p.name as project_name,
        COUNT(c.id) as comments_count,
        COUNT(a.id) as attachments_count,
        COALESCE(SUM(tl.hours_spent), 0) as total_time_spent
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN milestones m ON t.milestone_id = m.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN comments c ON t.id = c.task_id
      LEFT JOIN attachments a ON t.id = a.task_id
      LEFT JOIN time_logs tl ON t.id = tl.task_id
      WHERE ${whereClause}
      GROUP BY t.id, u1.first_name, u1.last_name, u1.username, u1.avatar_url, 
               u2.first_name, u2.last_name, u2.username, m.name, p.name
      ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        t.due_date ASC,
        t.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    queryParams.push(limit, offset);

    const tasksResult = await pool.query(tasksQuery, queryParams);
    const tasks = tasksResult.rows;

    const totalPages = Math.ceil(totalItems / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      tasks,
      currentPage: page,
      totalPages,
      totalItems,
      hasNext,
      hasPrev
    };
  }

  // Get task by ID
  async getTaskById(taskId, userId) {
    const query = `
      SELECT 
        t.*,
        u1.first_name as assigned_first_name,
        u1.last_name as assigned_last_name,
        u1.username as assigned_username,
        u1.avatar_url as assigned_avatar,
        u2.first_name as creator_first_name,
        u2.last_name as creator_last_name,
        u2.username as creator_username,
        m.name as milestone_name,
        m.id as milestone_id,
        p.name as project_name,
        p.id as project_id
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN milestones m ON t.milestone_id = m.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = $1
    `;

    const result = await pool.query(query, [taskId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const task = result.rows[0];

    // Check if user has access to this project
    const accessCheck = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [task.project_id, userId]
    );
    if (accessCheck.rows.length === 0) {
      throw new Error('Access denied to this task');
    }

    // Get subtasks
    const subtasksQuery = `
      SELECT 
        t.*,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name,
        u.username as assigned_username
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.parent_task_id = $1
      ORDER BY t.priority DESC, t.due_date ASC
    `;
    const subtasksResult = await pool.query(subtasksQuery, [taskId]);
    task.subtasks = subtasksResult.rows;

    return task;
  }

  // Create new task
  async createTask(taskData, userId) {
    const { 
      project_id, milestone_id, title, description, status, priority, 
      type, estimated_hours, due_date, assigned_to, parent_task_id 
    } = taskData;

    // Check if user has access to this project
    const accessCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project_id, userId]
    );
    if (accessCheck.rows.length === 0) {
      throw new Error('Access denied to this project');
    }

    // Check if project exists
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1',
      [project_id]
    );
    if (projectCheck.rows.length === 0) {
      throw new Error('Project not found');
    }

    // Check if milestone exists (if provided)
    if (milestone_id) {
      const milestoneCheck = await pool.query(
        'SELECT id FROM milestones WHERE id = $1 AND project_id = $2',
        [milestone_id, project_id]
      );
      if (milestoneCheck.rows.length === 0) {
        throw new Error('Milestone not found or does not belong to this project');
      }
    }

    // Auto-assign to creator if no assignee specified
    const finalAssignedTo = assigned_to || userId;

    // Check if assigned user is a project member (if provided)
    if (finalAssignedTo) {
      const memberCheck = await pool.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
        [project_id, finalAssignedTo]
      );
      if (memberCheck.rows.length === 0) {
        throw new Error('Assigned user is not a member of this project');
      }
    }

    // Check if parent task exists (if provided)
    if (parent_task_id) {
      const parentCheck = await pool.query(
        'SELECT id FROM tasks WHERE id = $1 AND project_id = $2',
        [parent_task_id, project_id]
      );
      if (parentCheck.rows.length === 0) {
        throw new Error('Parent task not found or does not belong to this project');
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks (project_id, milestone_id, title, description, status, priority, type, estimated_hours, due_date, assigned_to, created_by, parent_task_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [project_id, milestone_id, title, description, status, priority, type, estimated_hours, due_date, finalAssignedTo, userId, parent_task_id]
    );

    return result.rows[0];
  }

  // Update task
  async updateTask(taskId, updateData, userId) {
    const { 
      title, description, status, priority, type, estimated_hours, 
      actual_hours, progress_percentage, due_date, milestone_id 
    } = updateData;

    // Get task and check access
    const taskQuery = await pool.query(
      'SELECT project_id, assigned_to FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskQuery.rows.length === 0) {
      throw new Error('Task not found');
    }

    const task = taskQuery.rows[0];

    // Check if user has access to this project
    const accessCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [task.project_id, userId]
    );
    if (accessCheck.rows.length === 0) {
      throw new Error('Access denied to this task');
    }

    // Only assigned user or project manager can update task details
    const userRole = accessCheck.rows[0].role;
    if (task.assigned_to !== userId && !['project_manager', 'admin'].includes(userRole)) {
      throw new Error('Insufficient permissions to update this task');
    }

    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           type = COALESCE($5, type),
           estimated_hours = COALESCE($6, estimated_hours),
           actual_hours = COALESCE($7, actual_hours),
           progress_percentage = COALESCE($8, progress_percentage),
           due_date = COALESCE($9, due_date),
           milestone_id = COALESCE($10, milestone_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [title, description, status, priority, type, estimated_hours, actual_hours, progress_percentage, due_date, milestone_id, taskId]
    );

    return result.rows[0];
  }

  // Assign task to user
  async assignTask(taskId, assignedTo, userId) {
    // Get task and check access
    const taskQuery = await pool.query(
      'SELECT project_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskQuery.rows.length === 0) {
      throw new Error('Task not found');
    }

    const projectId = taskQuery.rows[0].project_id;

    // Check if user has permission to assign tasks
    const accessCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (accessCheck.rows.length === 0 || !['project_manager', 'admin'].includes(accessCheck.rows[0].role)) {
      throw new Error('Insufficient permissions to assign tasks');
    }

    // Check if assigned user is a project member (only if assigning to someone, not unassigning)
    if (assignedTo) {
      const memberCheck = await pool.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, assignedTo]
      );
      if (memberCheck.rows.length === 0) {
        throw new Error('Assigned user is not a member of this project');
      }
    }

    const result = await pool.query(
      `UPDATE tasks 
       SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [assignedTo, taskId]
    );

    return result.rows[0];
  }

  // Update task status
  async updateTaskStatus(taskId, status, userId) {
    console.log('🔍 updateTaskStatus called:', { taskId, status, userId });
    
    // Get task and check access
    const taskQuery = await pool.query(
      'SELECT project_id, assigned_to FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskQuery.rows.length === 0) {
      console.log('❌ Task not found:', taskId);
      throw new Error('Task not found');
    }

    const task = taskQuery.rows[0];
    console.log('📋 Task found:', { projectId: task.project_id, assignedTo: task.assigned_to });

    // Check if user has access to this project
    const accessCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [task.project_id, userId]
    );
    if (accessCheck.rows.length === 0) {
      console.log('❌ Access denied - user not in project');
      throw new Error('Access denied to this task');
    }

    const userRole = accessCheck.rows[0].role;
    console.log('👤 User role:', userRole);

    // Only assigned user or project manager can update status
    if (task.assigned_to !== userId && !['project_manager', 'admin'].includes(userRole)) {
      console.log('❌ Insufficient permissions:', { 
        taskAssignedTo: task.assigned_to, 
        userId, 
        userRole 
      });
      throw new Error('Insufficient permissions to update task status');
    }

    // Validate status
    const validStatuses = ['todo', 'in_progress', 'review', 'completed', 'closed', 'cancelled'];
    console.log('✅ Valid statuses:', validStatuses);
    console.log('🔍 Checking status:', status, 'Type:', typeof status);
    
    if (!validStatuses.includes(status)) {
      console.log('❌ Invalid status:', status);
      throw new Error('Invalid status');
    }

    console.log('✅ Status validation passed, updating database...');

    const result = await pool.query(
      `UPDATE tasks 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, taskId]
    );

    console.log('✅ Database update successful:', result.rows[0].status);
    return result.rows[0];
  }

  // Update task progress
  async updateTaskProgress(taskId, progressPercentage, userId) {
    // Get task and check access
    const taskQuery = await pool.query(
      'SELECT project_id, assigned_to FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskQuery.rows.length === 0) {
      throw new Error('Task not found');
    }

    const task = taskQuery.rows[0];

    // Check if user has access to this project
    const accessCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [task.project_id, userId]
    );
    if (accessCheck.rows.length === 0) {
      throw new Error('Access denied to this task');
    }

    // Only assigned user or project manager can update progress
    const userRole = accessCheck.rows[0].role;
    if (task.assigned_to !== userId && !['project_manager', 'admin'].includes(userRole)) {
      throw new Error('Insufficient permissions to update task progress');
    }

    // Validate progress percentage
    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    const result = await pool.query(
      `UPDATE tasks 
       SET progress_percentage = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [progressPercentage, taskId]
    );

    return result.rows[0];
  }

  // Delete task
  async deleteTask(taskId, userId) {
    // Get task and check access
    const taskQuery = await pool.query(
      'SELECT project_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskQuery.rows.length === 0) {
      throw new Error('Task not found');
    }

    const projectId = taskQuery.rows[0].project_id;

    // Check if user has permission to delete tasks
    const accessCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (accessCheck.rows.length === 0 || !['project_manager', 'admin'].includes(accessCheck.rows[0].role)) {
      throw new Error('Insufficient permissions to delete tasks');
    }

    // Check if task has subtasks
    const subtasksCheck = await pool.query(
      'SELECT COUNT(*) as subtask_count FROM tasks WHERE parent_task_id = $1',
      [taskId]
    );

    if (parseInt(subtasksCheck.rows[0].subtask_count) > 0) {
      throw new Error('Cannot delete task with subtasks. Please delete subtasks first.');
    }

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [taskId]
    );

    return { id: taskId };
  }

  // Get user's tasks
  async getUserTasks(userId, options = {}) {
    const { status, priority, project_id, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let whereConditions = ['t.assigned_to = $1'];
    let queryParams = [userId];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`t.status = $${++paramCount}`);
      queryParams.push(status);
    }

    if (priority) {
      whereConditions.push(`t.priority = $${++paramCount}`);
      queryParams.push(priority);
    }

    if (project_id) {
      whereConditions.push(`t.project_id = $${++paramCount}`);
      queryParams.push(project_id);
    }

    const whereClause = whereConditions.join(' AND ');

    // Count total tasks
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tasks t
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].total);

    // Get tasks with related data
    const tasksQuery = `
      SELECT 
        t.*,
        p.name as project_name,
        p.id as project_id,
        m.name as milestone_name,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.username as creator_username
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN milestones m ON t.milestone_id = m.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE ${whereClause}
      ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        t.due_date ASC,
        t.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    queryParams.push(limit, offset);

    const tasksResult = await pool.query(tasksQuery, queryParams);
    const tasks = tasksResult.rows;

    const totalPages = Math.ceil(totalItems / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      tasks,
      currentPage: page,
      totalPages,
      totalItems,
      hasNext,
      hasPrev
    };
  }

  // Get all tasks user has access to across all projects
  async getAllUserTasks(userId, options = {}) {
    const { status, priority, project_id, assigned_to, search, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let whereConditions = ['pm.user_id = $1'];
    let queryParams = [userId];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`t.status = $${++paramCount}`);
      queryParams.push(status);
    }

    if (priority) {
      whereConditions.push(`t.priority = $${++paramCount}`);
      queryParams.push(priority);
    }

    if (project_id) {
      whereConditions.push(`t.project_id = $${++paramCount}`);
      queryParams.push(project_id);
    }

    if (assigned_to) {
      if (assigned_to === 'unassigned') {
        whereConditions.push('t.assigned_to IS NULL');
      } else {
        whereConditions.push(`t.assigned_to = $${++paramCount}`);
        queryParams.push(assigned_to);
      }
    }

    if (search) {
      whereConditions.push(`(t.title ILIKE $${++paramCount} OR t.description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Count total tasks
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].total);

    // Get tasks with related data
    const tasksQuery = `
      SELECT 
        t.*,
        p.name as project_name,
        p.id as project_id,
        m.name as milestone_name,
        u1.first_name as assigned_first_name,
        u1.last_name as assigned_last_name,
        u1.username as assigned_username,
        u1.avatar_url as assigned_avatar,
        u2.first_name as creator_first_name,
        u2.last_name as creator_last_name,
        u2.username as creator_username,
        COUNT(c.id) as comments_count,
        COUNT(a.id) as attachments_count,
        COALESCE(SUM(tl.hours_spent), 0) as total_time_spent
      FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN milestones m ON t.milestone_id = m.id
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN comments c ON t.id = c.task_id
      LEFT JOIN attachments a ON t.id = a.task_id
      LEFT JOIN time_logs tl ON t.id = tl.task_id
      WHERE ${whereClause}
      GROUP BY t.id, p.name, p.id, m.name, u1.first_name, u1.last_name, u1.username, u1.avatar_url, 
               u2.first_name, u2.last_name, u2.username
      ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        t.due_date ASC,
        t.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    queryParams.push(limit, offset);

    const tasksResult = await pool.query(tasksQuery, queryParams);
    const tasks = tasksResult.rows;

    const totalPages = Math.ceil(totalItems / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      tasks,
      currentPage: page,
      totalPages,
      totalItems,
      hasNext,
      hasPrev
    };
  }

  // Get user's assigned tasks
  async getUserAssignedTasks(userId, options = {}) {
    const { status, priority, project_id, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let whereConditions = ['t.assigned_to = $1'];
    let queryParams = [userId];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`t.status = $${++paramCount}`);
      queryParams.push(status);
    }

    if (priority) {
      whereConditions.push(`t.priority = $${++paramCount}`);
      queryParams.push(priority);
    }

    if (project_id) {
      whereConditions.push(`t.project_id = $${++paramCount}`);
      queryParams.push(project_id);
    }

    const whereClause = whereConditions.join(' AND ');

    // Count total tasks
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tasks t
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].total);

    // Get tasks with related data
    const tasksQuery = `
      SELECT 
        t.*,
        p.name as project_name,
        p.id as project_id,
        m.name as milestone_name,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.username as creator_username
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN milestones m ON t.milestone_id = m.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE ${whereClause}
      ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        t.due_date ASC,
        t.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    queryParams.push(limit, offset);

    const tasksResult = await pool.query(tasksQuery, queryParams);
    const tasks = tasksResult.rows;

    const totalPages = Math.ceil(totalItems / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      tasks,
      currentPage: page,
      totalPages,
      totalItems,
      hasNext,
      hasPrev
    };
  }

  // Get overdue tasks
  async getOverdueTasks(userId) {
    const query = `
      SELECT 
        t.*,
        p.name as project_name,
        p.id as project_id,
        m.name as milestone_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN milestones m ON t.milestone_id = m.id
      WHERE pm.user_id = $1 
        AND t.due_date < CURRENT_TIMESTAMP 
        AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.due_date ASC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

module.exports = new TaskController(); 