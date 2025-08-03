-- Project Management System Database Schema
-- PostgreSQL Database Schema for Project Management Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users/Team Members Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Milestones Table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'closed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    type VARCHAR(50) DEFAULT 'task' CHECK (type IN ('task', 'bug', 'feature', 'story')),
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    due_date TIMESTAMP,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- For subtasks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roles (Many-to-Many Relationship)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- NULL for global roles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id, project_id)
);

-- Project Team Members (Many-to-Many Relationship)
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Comments Table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ensure comment belongs to exactly one entity
    CONSTRAINT comment_entity_check CHECK (
        (task_id IS NOT NULL AND project_id IS NULL AND milestone_id IS NULL) OR
        (task_id IS NULL AND project_id IS NOT NULL AND milestone_id IS NULL) OR
        (task_id IS NULL AND project_id IS NULL AND milestone_id IS NOT NULL)
    )
);

-- Attachments Table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ensure attachment belongs to exactly one entity
    CONSTRAINT attachment_entity_check CHECK (
        (task_id IS NOT NULL AND project_id IS NULL AND milestone_id IS NULL AND comment_id IS NULL) OR
        (task_id IS NULL AND project_id IS NOT NULL AND milestone_id IS NULL AND comment_id IS NULL) OR
        (task_id IS NULL AND project_id IS NULL AND milestone_id IS NOT NULL AND comment_id IS NULL) OR
        (task_id IS NULL AND project_id IS NULL AND milestone_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Time Logs Table
CREATE TABLE time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT,
    hours_spent DECIMAL(8,2) NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_billable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUXILIARY TABLES
-- ============================================================================

-- Task Watchers (Many-to-Many Relationship)
CREATE TABLE task_watchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, user_id)
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50), -- 'project', 'task', 'milestone', etc.
    related_entity_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'task', 'milestone', etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings Table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, project_id, setting_key)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);

-- Projects indexes
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- Milestones indexes
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);
CREATE INDEX idx_milestones_created_by ON milestones(created_by);

-- Tasks indexes
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);

-- Comments indexes
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_comments_project ON comments(project_id);
CREATE INDEX idx_comments_milestone ON comments(milestone_id);
CREATE INDEX idx_comments_created ON comments(created_at);

-- Attachments indexes
CREATE INDEX idx_attachments_user ON attachments(user_id);
CREATE INDEX idx_attachments_task ON attachments(task_id);
CREATE INDEX idx_attachments_project ON attachments(project_id);
CREATE INDEX idx_attachments_milestone ON attachments(milestone_id);
CREATE INDEX idx_attachments_comment ON attachments(comment_id);
CREATE INDEX idx_attachments_mime ON attachments(mime_type);

-- Time logs indexes
CREATE INDEX idx_time_logs_user ON time_logs(user_id);
CREATE INDEX idx_time_logs_task ON time_logs(task_id);
CREATE INDEX idx_time_logs_project ON time_logs(project_id);
CREATE INDEX idx_time_logs_date ON time_logs(date);

-- User roles indexes
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_project ON user_roles(project_id);

-- Project members indexes
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- Task watchers indexes
CREATE INDEX idx_task_watchers_task ON task_watchers(task_id);
CREATE INDEX idx_task_watchers_user ON task_watchers(user_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Activity logs indexes
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_logs_updated_at BEFORE UPDATE ON time_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'System Administrator', '{"all": true}'),
('project_manager', 'Project Manager', '{"projects": {"create": true, "read": true, "update": true, "delete": true}, "tasks": {"create": true, "read": true, "update": true, "delete": true}, "milestones": {"create": true, "read": true, "update": true, "delete": true}}'),
('developer', 'Developer', '{"tasks": {"create": true, "read": true, "update": true}, "milestones": {"read": true}}'),
('viewer', 'Viewer', '{"projects": {"read": true}, "tasks": {"read": true}, "milestones": {"read": true}}');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Project summary view
CREATE VIEW project_summary AS
SELECT 
    p.id,
    p.name,
    p.status,
    p.priority,
    p.start_date,
    p.end_date,
    p.created_by,
    u.first_name || ' ' || u.last_name as created_by_name,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT m.id) as total_milestones,
    COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) as completed_milestones,
    COALESCE(SUM(tl.hours_spent), 0) as total_hours,
    COUNT(DISTINCT pm.user_id) as team_size
FROM projects p
LEFT JOIN users u ON p.created_by = u.id
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN milestones m ON p.id = m.project_id
LEFT JOIN time_logs tl ON p.id = tl.project_id
LEFT JOIN project_members pm ON p.id = pm.project_id
GROUP BY p.id, p.name, p.status, p.priority, p.start_date, p.end_date, p.created_by, u.first_name, u.last_name;

-- Task summary view
CREATE VIEW task_summary AS
SELECT 
    t.id,
    t.title,
    t.status,
    t.priority,
    t.due_date,
    t.project_id,
    p.name as project_name,
    t.milestone_id,
    m.name as milestone_name,
    t.assigned_to,
    u.first_name || ' ' || u.last_name as assigned_to_name,
    t.estimated_hours,
    t.actual_hours,
    t.progress_percentage,
    COALESCE(SUM(tl.hours_spent), 0) as logged_hours,
    COUNT(DISTINCT c.id) as comment_count,
    COUNT(DISTINCT a.id) as attachment_count
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
LEFT JOIN milestones m ON t.milestone_id = m.id
LEFT JOIN users u ON t.assigned_to = u.id
LEFT JOIN time_logs tl ON t.id = tl.task_id
LEFT JOIN comments c ON t.id = c.task_id
LEFT JOIN attachments a ON t.id = a.task_id
GROUP BY t.id, t.title, t.status, t.priority, t.due_date, t.project_id, p.name, t.milestone_id, m.name, t.assigned_to, u.first_name, u.last_name, t.estimated_hours, t.actual_hours, t.progress_percentage;

-- User activity view
CREATE VIEW user_activity AS
SELECT 
    u.id,
    u.username,
    u.first_name || ' ' || u.last_name as full_name,
    COUNT(DISTINCT t.id) as assigned_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COALESCE(SUM(tl.hours_spent), 0) as total_hours_logged,
    COUNT(DISTINCT c.id) as comments_made,
    COUNT(DISTINCT a.id) as attachments_uploaded,
    u.last_login
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to
LEFT JOIN time_logs tl ON u.id = tl.user_id
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN attachments a ON u.id = a.user_id
GROUP BY u.id, u.username, u.first_name, u.last_name, u.last_login;

-- ============================================================================
-- COMMENTS FOR PGADMIN4
-- ============================================================================

COMMENT ON TABLE users IS 'Stores user account information and authentication data';
COMMENT ON TABLE roles IS 'Defines system roles and their permissions';
COMMENT ON TABLE user_roles IS 'Many-to-many relationship between users and roles';
COMMENT ON TABLE projects IS 'Main project entities with metadata and status';
COMMENT ON TABLE milestones IS 'Project milestones for tracking major deliverables';
COMMENT ON TABLE tasks IS 'Individual work items within projects and milestones';
COMMENT ON TABLE project_members IS 'Many-to-many relationship between projects and users';
COMMENT ON TABLE comments IS 'User comments on projects, tasks, and milestones';
COMMENT ON TABLE attachments IS 'File attachments for projects, tasks, and comments';
COMMENT ON TABLE time_logs IS 'Time tracking entries for tasks and projects';
COMMENT ON TABLE task_watchers IS 'Users watching specific tasks for updates';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE activity_logs IS 'Audit trail of user actions and system events';
COMMENT ON TABLE settings IS 'User and project-specific settings and preferences';

COMMENT ON COLUMN users.id IS 'Primary key using UUID for security';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN users.is_verified IS 'Whether email has been verified';

COMMENT ON COLUMN projects.status IS 'Project status: active, completed, on_hold, cancelled';
COMMENT ON COLUMN projects.priority IS 'Project priority: low, medium, high, urgent';
COMMENT ON COLUMN projects.created_by IS 'User who created the project';

COMMENT ON COLUMN milestones.status IS 'Milestone status: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN milestones.completion_percentage IS 'Percentage of milestone completion (0-100)';
COMMENT ON COLUMN milestones.due_date IS 'Due date for milestone completion';

COMMENT ON COLUMN tasks.status IS 'Task status: todo, in_progress, review, completed, cancelled';
COMMENT ON COLUMN tasks.priority IS 'Task priority: low, medium, high, urgent';
COMMENT ON COLUMN tasks.type IS 'Task type: task, bug, feature, story';
COMMENT ON COLUMN tasks.progress_percentage IS 'Percentage of task completion (0-100)';
COMMENT ON COLUMN tasks.parent_task_id IS 'For subtasks - references parent task';

COMMENT ON COLUMN comments.parent_comment_id IS 'For nested comments - references parent comment';
COMMENT ON COLUMN comments.is_edited IS 'Whether the comment has been edited';

COMMENT ON COLUMN attachments.file_path IS 'Storage path for the file';
COMMENT ON COLUMN attachments.file_size IS 'File size in bytes';
COMMENT ON COLUMN attachments.mime_type IS 'MIME type of the file';

COMMENT ON COLUMN time_logs.hours_spent IS 'Time spent in hours (decimal)';
COMMENT ON COLUMN time_logs.is_billable IS 'Whether the time is billable to client'; 