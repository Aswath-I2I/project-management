const { pool } = require('../config/database');

class ProjectController {
  // Get all projects with pagination and filtering
  async getAllProjects(userId, options = {}) {
    const { page = 1, limit = 10, status, priority, search } = options;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Check if user is admin or has access to projects
    const userRole = await this.getUserRole(userId);
    if (userRole !== 'admin') {
      // For non-admin users, only show projects they're members of
      whereConditions.push(`p.id IN (
        SELECT project_id FROM project_members WHERE user_id = $${++paramCount}
      )`);
      queryParams.push(userId);
    }

    if (status) {
      whereConditions.push(`p.status = $${++paramCount}`);
      queryParams.push(status);
    }

    if (priority) {
      whereConditions.push(`p.priority = $${++paramCount}`);
      queryParams.push(priority);
    }

    if (search) {
      whereConditions.push(`(p.name ILIKE $${++paramCount} OR p.description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total projects
    const countQuery = `
      SELECT COUNT(*) as total
      FROM projects p
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].total);

    // Get projects with related data
    const projectsQuery = `
      SELECT 
        p.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.username as creator_username,
        COUNT(DISTINCT m.id) as milestones_count,
        COUNT(DISTINCT t.id) as tasks_count,
        COUNT(DISTINCT pm.user_id) as team_members_count,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) as completed_tasks_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN milestones m ON p.id = m.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      ${whereClause}
      GROUP BY p.id, u.first_name, u.last_name, u.username
      ORDER BY p.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    queryParams.push(limit, offset);

    const projectsResult = await pool.query(projectsQuery, queryParams);
    const projects = projectsResult.rows;

    // Calculate progress for each project
    for (let project of projects) {
      project.progress_percentage = project.tasks_count > 0 
        ? Math.round((project.completed_tasks_count / project.tasks_count) * 100)
        : 0;
    }

    const totalPages = Math.ceil(totalItems / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      projects,
      currentPage: page,
      totalPages,
      totalItems,
      hasNext,
      hasPrev
    };
  }

  // Get project by ID with all related data
  async getProjectById(projectId, userId) {
    const userRole = await this.getUserRole(userId);
    
    // Check if user has access to this project
    if (userRole !== 'admin') {
      const accessCheck = await pool.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );
      if (accessCheck.rows.length === 0) {
        return null;
      }
    }

    // Get project details
    const projectQuery = `
      SELECT 
        p.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.username as creator_username
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = $1
    `;
    const projectResult = await pool.query(projectQuery, [projectId]);
    
    if (projectResult.rows.length === 0) {
      return null;
    }

    const project = projectResult.rows[0];

    // Get milestones
    const milestonesQuery = `
      SELECT 
        m.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        COUNT(t.id) as tasks_count,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) as completed_tasks_count
      FROM milestones m
      LEFT JOIN users u ON m.created_by = u.id
      LEFT JOIN tasks t ON m.id = t.milestone_id
      WHERE m.project_id = $1
      GROUP BY m.id, u.first_name, u.last_name
      ORDER BY m.due_date ASC
    `;
    const milestonesResult = await pool.query(milestonesQuery, [projectId]);
    project.milestones = milestonesResult.rows;

    // Get team members
    const teamQuery = `
      SELECT 
        u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.email,
        pm.role as project_role,
        pm.joined_at,
        array_agg(DISTINCT r.name) as global_roles
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE pm.project_id = $1
      GROUP BY u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.email, pm.role, pm.joined_at
      ORDER BY pm.joined_at ASC
    `;
    const teamResult = await pool.query(teamQuery, [projectId]);
    project.team_members = teamResult.rows.map(member => ({
      ...member,
      global_roles: member.global_roles.filter(role => role !== null)
    }));

    // Get tasks summary
    const tasksQuery = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
        COUNT(CASE WHEN priority = 'high' OR priority = 'urgent' THEN 1 END) as high_priority_tasks
      FROM tasks
      WHERE project_id = $1
    `;
    const tasksResult = await pool.query(tasksQuery, [projectId]);
    project.tasks_summary = tasksResult.rows[0];

    // Calculate overall progress
    project.progress_percentage = project.tasks_summary.total_tasks > 0 
      ? Math.round((project.tasks_summary.completed_tasks / project.tasks_summary.total_tasks) * 100)
      : 0;

    return project;
  }

  // Create new project
  async createProject(projectData, userId) {
    const { name, description, status, priority, start_date, end_date, budget } = projectData;

    const result = await pool.query(
      `INSERT INTO projects (name, description, status, priority, start_date, end_date, budget, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, status, priority, start_date, end_date, budget, userId]
    );

    const project = result.rows[0];

    // Add creator as project member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [project.id, userId, 'project_manager']
    );

    return project;
  }

  // Update project
  async updateProject(projectId, updateData, userId) {
    const userRole = await this.getUserRole(userId);
    
    // Check if user has permission to update this project
    if (userRole !== 'admin') {
      const accessCheck = await pool.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );
      if (accessCheck.rows.length === 0 || !['project_manager', 'admin'].includes(accessCheck.rows[0].role)) {
        throw new Error('Insufficient permissions to update this project');
      }
    }

    const { name, description, status, priority, start_date, end_date, budget } = updateData;
    
    const result = await pool.query(
      `UPDATE projects 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           start_date = COALESCE($5, start_date),
           end_date = COALESCE($6, end_date),
           budget = COALESCE($7, budget),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, description, status, priority, start_date, end_date, budget, projectId]
    );

    if (result.rows.length === 0) {
      throw new Error('Project not found');
    }

    return result.rows[0];
  }

  // Delete project
  async deleteProject(projectId, userId) {
    const userRole = await this.getUserRole(userId);
    
    // Check if user has permission to delete this project
    if (userRole !== 'admin') {
      const accessCheck = await pool.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );
      if (accessCheck.rows.length === 0 || accessCheck.rows[0].role !== 'project_manager') {
        throw new Error('Insufficient permissions to delete this project');
      }
    }

    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [projectId]
    );

    if (result.rows.length === 0) {
      throw new Error('Project not found');
    }

    return { id: projectId };
  }

  // Get user role
  async getUserRole(userId) {
    const result = await pool.query(
      `SELECT r.name 
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1
       LIMIT 1`,
      [userId]
    );
    
    return result.rows.length > 0 ? result.rows[0].name : 'user';
  }

  // Get project statistics
  async getProjectStats(projectId, userId) {
    const userRole = await this.getUserRole(userId);
    
    // Check if user has access to this project
    if (userRole !== 'admin') {
      const accessCheck = await pool.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );
      if (accessCheck.rows.length === 0) {
        return null;
      }
    }

    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM milestones WHERE project_id = $1) as total_milestones,
        (SELECT COUNT(*) FROM milestones WHERE project_id = $1 AND status = 'completed') as completed_milestones,
        (SELECT COUNT(*) FROM tasks WHERE project_id = $1) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = $1 AND status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM project_members WHERE project_id = $1) as team_size,
        (SELECT COALESCE(SUM(hours_spent), 0) FROM time_logs WHERE project_id = $1) as total_hours,
        (SELECT COUNT(*) FROM comments WHERE project_id = $1) as total_comments,
        (SELECT COUNT(*) FROM attachments WHERE project_id = $1) as total_attachments
    `;
    
    const statsResult = await pool.query(statsQuery, [projectId]);
    return statsResult.rows[0];
  }
}

module.exports = new ProjectController(); 