const { pool } = require('../config/database');

class TeamController {
  // Get assignable users (users in projects the current user has access to)
  async getAssignableUsers(userId, projectId = null) {
    let query;
    let queryParams;

    if (projectId) {
      // Get users for a specific project (if user has access to it)
      query = `
        SELECT DISTINCT
          u.id, u.username, u.email, u.first_name, u.last_name, u.avatar_url, u.phone, 
          u.is_active, u.is_verified, u.last_login, u.created_at
        FROM users u
        JOIN project_members pm ON u.id = pm.user_id
        WHERE pm.project_id = $1
          AND EXISTS (
            SELECT 1 FROM project_members pm2 
            WHERE pm2.project_id = $1 AND pm2.user_id = $2
          )
        ORDER BY u.first_name, u.last_name
      `;
      queryParams = [projectId, userId];
    } else {
      // Get users from all projects the current user has access to
      query = `
        SELECT DISTINCT
          u.id, u.username, u.email, u.first_name, u.last_name, u.avatar_url, u.phone, 
          u.is_active, u.is_verified, u.last_login, u.created_at
        FROM users u
        JOIN project_members pm ON u.id = pm.user_id
        WHERE EXISTS (
          SELECT 1 FROM project_members pm2 
          WHERE pm2.project_id = pm.project_id AND pm2.user_id = $1
        )
        ORDER BY u.first_name, u.last_name
      `;
      queryParams = [userId];
    }

    const result = await pool.query(query, queryParams);
    return result.rows;
  }

  // Get all users (similar to getAssignableUsers but with search and pagination)
  async getAllUsers(options = {}) {
    console.log('getAllUsers called with options:', options);
    const { page = 1, limit = 20, search, is_active, role } = options;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Base query similar to getAssignableUsers
    let baseQuery = `
      SELECT DISTINCT
        u.id, u.username, u.email, u.first_name, u.last_name, u.avatar_url, u.phone, 
        u.is_active, u.is_verified, u.last_login, u.created_at
      FROM users u
    `;

    // Add search conditions
    if (search) {
      whereConditions.push(`(u.username ILIKE $${++paramCount} OR u.email ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    // Add active status filter
    if (is_active !== undefined) {
      whereConditions.push(`u.is_active = $${++paramCount}`);
      queryParams.push(is_active);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    console.log('Where clause:', whereClause);
    console.log('Query params:', queryParams);

    // Count total users
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].total);
    console.log('Total items:', totalItems);

    // Get users with pagination
    const usersQuery = `
      ${baseQuery}
      ${whereClause}
      ORDER BY u.first_name, u.last_name
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    queryParams.push(limit, offset);
    console.log('Users query:', usersQuery);
    console.log('Final query params:', queryParams);

    const usersResult = await pool.query(usersQuery, queryParams);
    console.log('Raw users result count:', usersResult.rows.length);
    
    if (usersResult.rows.length > 0) {
      console.log('First user:', usersResult.rows[0].username);
    }

    let users = usersResult.rows;

    // If role filter is specified, we need to get roles for filtering
    if (role && role.trim() !== '') {
      console.log('Filtering by role:', role);
      
      // Get roles for all users
      const userIds = users.map(u => u.id);
      if (userIds.length > 0) {
        const rolesQuery = `
          SELECT ur.user_id, r.name as role_name
          FROM user_roles ur
          JOIN roles r ON ur.role_id = r.id
          WHERE ur.user_id = ANY($1)
        `;
        const rolesResult = await pool.query(rolesQuery, [userIds]);
        
        // Group roles by user
        const userRoles = {};
        rolesResult.rows.forEach(row => {
          if (!userRoles[row.user_id]) {
            userRoles[row.user_id] = [];
          }
          userRoles[row.user_id].push(row.role_name);
        });
        
        // Filter users by role
        users = users.filter(user => {
          const userRoleList = userRoles[user.id] || [];
          return userRoleList.includes(role);
        });
        
        console.log('Users after role filtering:', users.length);
      }
    }

    // Add roles to user objects
    const userIds = users.map(u => u.id);
    if (userIds.length > 0) {
      const rolesQuery = `
        SELECT ur.user_id, r.name as role_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ANY($1)
      `;
      const rolesResult = await pool.query(rolesQuery, [userIds]);
      
      // Group roles by user
      const userRoles = {};
      rolesResult.rows.forEach(row => {
        if (!userRoles[row.user_id]) {
          userRoles[row.user_id] = [];
        }
        userRoles[row.user_id].push(row.role_name);
      });
      
      // Add roles to user objects
      users = users.map(user => ({
        ...user,
        global_roles: userRoles[user.id] || []
      }));
    } else {
      // Add empty roles array if no users
      users = users.map(user => ({
        ...user,
        global_roles: []
      }));
    }

    const totalPages = Math.ceil(totalItems / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    console.log('Final result:', { users: users.length, totalItems, totalPages });

    return {
      users,
      currentPage: page,
      totalPages,
      totalItems,
      hasNext,
      hasPrev
    };
  }

  // Get user by ID
  async getUserById(userId) {
    const query = `
      SELECT 
        u.*,
        array_agg(DISTINCT r.name) as global_roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id
    `;

    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    user.global_roles = user.global_roles.filter(role => role !== null);

    return user;
  }

  // Get current user's role in project
  async getCurrentUserRole(projectId, userId) {
    const query = `
      SELECT role 
      FROM project_members 
      WHERE project_id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [projectId, userId]);
    
    if (result.rows.length === 0) {
      return null; // User is not a member of this project
    }

    return result.rows[0].role;
  }

  // Get project team members
  async getProjectTeam(projectId, userId) {
    // Check if user has access to this project
    const accessCheck = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (accessCheck.rows.length === 0) {
      throw new Error('Access denied to this project');
    }

    const query = `
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name, u.avatar_url, u.phone,
        u.is_active, u.is_verified, u.last_login,
        pm.role as project_role,
        pm.joined_at,
        array_agg(DISTINCT r.name) as global_roles,
        COUNT(DISTINCT t.id) as assigned_tasks_count,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks_count
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN tasks t ON u.id = t.assigned_to AND t.project_id = pm.project_id
      WHERE pm.project_id = $1
      GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.avatar_url, u.phone,
               u.is_active, u.is_verified, u.last_login, pm.role, pm.joined_at
      ORDER BY pm.joined_at ASC
    `;

    const result = await pool.query(query, [projectId]);
    const team = result.rows.map(member => ({
      ...member,
      global_roles: member.global_roles.filter(role => role !== null)
    }));

    return team;
  }

  // Add user to project
  async addUserToProject(projectId, userId, targetUserId, role = 'member') {
    // Check if user has permission to add team members
    const accessCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (accessCheck.rows.length === 0 || !['project_manager', 'admin'].includes(accessCheck.rows[0].role)) {
      throw new Error('Insufficient permissions to add team members');
    }

    // Check if target user exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND is_active = true',
      [targetUserId]
    );
    if (userCheck.rows.length === 0) {
      throw new Error('User not found or inactive');
    }

    // Check if user is already a project member
    const existingCheck = await pool.query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, targetUserId]
    );
    if (existingCheck.rows.length > 0) {
      throw new Error('User is already a member of this project');
    }

    // Validate role
    const validRoles = ['member', 'developer', 'project_manager', 'viewer'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role');
    }

    const result = await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [projectId, targetUserId, role]
    );

    return result.rows[0];
  }

  // Update project member role
  async updateProjectMemberRole(projectId, userId, targetUserId, newRole) {
    // Check if user has permission to update team member roles
    const accessCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (accessCheck.rows.length === 0 || !['project_manager', 'admin'].includes(accessCheck.rows[0].role)) {
      throw new Error('Insufficient permissions to update team member roles');
    }

    // Check if target user is a project member
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, targetUserId]
    );
    if (memberCheck.rows.length === 0) {
      throw new Error('User is not a member of this project');
    }

    // Validate role
    const validRoles = ['member', 'developer', 'project_manager', 'viewer'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid role');
    }

    // Prevent removing the last project manager
    if (memberCheck.rows[0].role === 'project_manager' && newRole !== 'project_manager') {
      const managerCount = await pool.query(
        'SELECT COUNT(*) as count FROM project_members WHERE project_id = $1 AND role = $2',
        [projectId, 'project_manager']
      );
      if (parseInt(managerCount.rows[0].count) <= 1) {
        throw new Error('Cannot remove the last project manager');
      }
    }

    const result = await pool.query(
      'UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3 RETURNING *',
      [newRole, projectId, targetUserId]
    );

    return result.rows[0];
  }

  // Remove user from project
  async removeUserFromProject(projectId, userId, targetUserId) {
    // Check if user has permission to remove team members
    const accessCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (accessCheck.rows.length === 0 || !['project_manager', 'admin'].includes(accessCheck.rows[0].role)) {
      throw new Error('Insufficient permissions to remove team members');
    }

    // Check if target user is a project member
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, targetUserId]
    );
    if (memberCheck.rows.length === 0) {
      throw new Error('User is not a member of this project');
    }

    // Prevent removing the last project manager
    if (memberCheck.rows[0].role === 'project_manager') {
      const managerCount = await pool.query(
        'SELECT COUNT(*) as count FROM project_members WHERE project_id = $1 AND role = $2',
        [projectId, 'project_manager']
      );
      if (parseInt(managerCount.rows[0].count) <= 1) {
        throw new Error('Cannot remove the last project manager');
      }
    }

    // Check if user has assigned tasks
    const tasksCheck = await pool.query(
      'SELECT COUNT(*) as count FROM tasks WHERE project_id = $1 AND assigned_to = $2 AND status NOT IN ($3, $4)',
      [projectId, targetUserId, 'completed', 'cancelled']
    );
    if (parseInt(tasksCheck.rows[0].count) > 0) {
      throw new Error('Cannot remove user with active assigned tasks. Please reassign tasks first.');
    }

    const result = await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *',
      [projectId, targetUserId]
    );

    return result.rows[0];
  }

  // Get user's projects
  async getUserProjects(userId) {
    const query = `
      SELECT 
        p.*,
        pm.role as user_role,
        pm.joined_at,
        COUNT(DISTINCT m.id) as milestones_count,
        COUNT(DISTINCT t.id) as tasks_count,
        COUNT(DISTINCT pm2.user_id) as team_size
      FROM project_members pm
      JOIN projects p ON pm.project_id = p.id
      LEFT JOIN milestones m ON p.id = m.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      LEFT JOIN project_members pm2 ON p.id = pm2.project_id
      WHERE pm.user_id = $1
      GROUP BY p.id, pm.role, pm.joined_at
      ORDER BY p.updated_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Get user's assigned tasks
  async getUserAssignedTasks(userId, options = {}) {
    const { project_id, status, priority, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let whereConditions = ['t.assigned_to = $1'];
    let queryParams = [userId];
    let paramCount = 1;

    if (project_id) {
      whereConditions.push(`t.project_id = $${++paramCount}`);
      queryParams.push(project_id);
    }

    if (status) {
      whereConditions.push(`t.status = $${++paramCount}`);
      queryParams.push(status);
    }

    if (priority) {
      whereConditions.push(`t.priority = $${++paramCount}`);
      queryParams.push(priority);
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

    // Get tasks with project info
    const tasksQuery = `
      SELECT 
        t.*,
        p.name as project_name,
        p.id as project_id,
        m.name as milestone_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN milestones m ON t.milestone_id = m.id
      WHERE ${whereClause}
      ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        t.due_date ASC
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

  // Get user statistics
  async getUserStats(userId) {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM project_members WHERE user_id = $1) as total_projects,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = $1) as total_assigned_tasks,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'in_progress') as in_progress_tasks,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND due_date < CURRENT_TIMESTAMP AND status NOT IN ('completed', 'cancelled')) as overdue_tasks,
        (SELECT COALESCE(SUM(hours_spent), 0) FROM time_logs WHERE user_id = $1) as total_hours_logged
    `;

    const statsResult = await pool.query(statsQuery, [userId]);
    return statsResult.rows[0];
  }

  // Create new user
  async createUser(userData) {
    const { first_name, last_name, email, username, password, role = 'team_member', is_active = true } = userData;

    // Check if email or username already exists
    const existingUserQuery = `
      SELECT id FROM users WHERE email = $1 OR username = $2
    `;
    const existingUserResult = await pool.query(existingUserQuery, [email, username]);
    
    if (existingUserResult.rows.length > 0) {
      throw new Error('Email or username already exists');
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const insertUserQuery = `
      INSERT INTO users (first_name, last_name, email, username, password_hash, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, first_name, last_name, email, username, is_active, created_at
    `;
    
    const userResult = await pool.query(insertUserQuery, [
      first_name, last_name, email, username, hashedPassword, is_active
    ]);

    const newUser = userResult.rows[0];

    // Assign role
    if (role) {
      const roleQuery = `
        INSERT INTO user_roles (user_id, role_id, created_at)
        SELECT $1, r.id, CURRENT_TIMESTAMP
        FROM roles r
        WHERE r.name = $2
      `;
      await pool.query(roleQuery, [newUser.id, role]);
    }

    return {
      ...newUser,
      role: role
    };
  }

  // Update user
  async updateUser(userId, userData) {
    const { first_name, last_name, email, username, password, role, is_active } = userData;

    // Check if user exists
    const existingUserQuery = `SELECT id FROM users WHERE id = $1`;
    const existingUserResult = await pool.query(existingUserQuery, [userId]);
    
    if (existingUserResult.rows.length === 0) {
      return null;
    }

    // Check if email or username already exists (excluding current user)
    if (email || username) {
      const duplicateQuery = `
        SELECT id FROM users WHERE (email = $1 OR username = $2) AND id != $3
      `;
      const duplicateResult = await pool.query(duplicateQuery, [email, username, userId]);
      
      if (duplicateResult.rows.length > 0) {
        throw new Error('Email or username already exists');
      }
    }

    // Build update query dynamically
    let updateFields = [];
    let queryParams = [];
    let paramCount = 0;

    if (first_name !== undefined) {
      updateFields.push(`first_name = $${++paramCount}`);
      queryParams.push(first_name);
    }

    if (last_name !== undefined) {
      updateFields.push(`last_name = $${++paramCount}`);
      queryParams.push(last_name);
    }

    if (email !== undefined) {
      updateFields.push(`email = $${++paramCount}`);
      queryParams.push(email);
    }

    if (username !== undefined) {
      updateFields.push(`username = $${++paramCount}`);
      queryParams.push(username);
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${++paramCount}`);
      queryParams.push(is_active);
    }

    if (password) {
      const bcrypt = require('bcrypt');
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push(`password_hash = $${++paramCount}`);
      queryParams.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    queryParams.push(userId);

    const updateUserQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING id, first_name, last_name, email, username, is_active, created_at, updated_at
    `;

    const userResult = await pool.query(updateUserQuery, queryParams);
    const updatedUser = userResult.rows[0];

    // Update role if provided
    if (role) {
      // Remove existing roles
      await pool.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
      
      // Add new role
      const roleQuery = `
        INSERT INTO user_roles (user_id, role_id, created_at)
        SELECT $1, r.id, CURRENT_TIMESTAMP
        FROM roles r
        WHERE r.name = $2
      `;
      await pool.query(roleQuery, [userId, role]);
    }

    return {
      ...updatedUser,
      role: role
    };
  }

  // Delete user
  async deleteUser(userId) {
    // Check if user exists
    const existingUserQuery = `SELECT id FROM users WHERE id = $1`;
    const existingUserResult = await pool.query(existingUserQuery, [userId]);
    
    if (existingUserResult.rows.length === 0) {
      return false;
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete user roles
      await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
      
      // Delete project memberships
      await client.query('DELETE FROM project_members WHERE user_id = $1', [userId]);
      
      // Update tasks to unassign them
      await client.query('UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1', [userId]);
      
      // Delete time logs
      await client.query('DELETE FROM time_logs WHERE user_id = $1', [userId]);
      
      // Delete comments
      await client.query('DELETE FROM comments WHERE user_id = $1', [userId]);
      
      // Finally delete the user
      await client.query('DELETE FROM users WHERE id = $1', [userId]);

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update user role
  async updateUserRole(userId, role) {
    // Check if user exists
    const existingUserQuery = `SELECT id FROM users WHERE id = $1`;
    const existingUserResult = await pool.query(existingUserQuery, [userId]);
    
    if (existingUserResult.rows.length === 0) {
      return null;
    }

    // Remove existing roles
    await pool.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
    
    // Add new role
    const roleQuery = `
      INSERT INTO user_roles (user_id, role_id, created_at)
      SELECT $1, r.id, CURRENT_TIMESTAMP
      FROM roles r
      WHERE r.name = $2
    `;
    await pool.query(roleQuery, [userId, role]);

    // Get updated user
    const userQuery = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.username, u.is_active, u.created_at, u.updated_at
      FROM users u
      WHERE u.id = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);
    
    return {
      ...userResult.rows[0],
      role: role
    };
  }

  // Update user status
  async updateUserStatus(userId, isActive) {
    const updateQuery = `
      UPDATE users 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, first_name, last_name, email, username, is_active, created_at, updated_at
    `;
    
    const result = await pool.query(updateQuery, [isActive, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }
}

module.exports = new TeamController(); 