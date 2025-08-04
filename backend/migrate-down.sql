-- Migration Down Script
-- This script will rollback all database changes made by railway-setup.sql
-- WARNING: This will delete all data and schema changes!

-- Drop all triggers first
DROP TRIGGER IF EXISTS update_time_logs_updated_at ON time_logs;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS update_milestones_updated_at ON milestones;
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;

-- Drop the update_updated_at_column function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop all indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_active;

DROP INDEX IF EXISTS idx_user_roles_user;
DROP INDEX IF EXISTS idx_user_roles_role;

DROP INDEX IF EXISTS idx_projects_created_by;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_dates;

DROP INDEX IF EXISTS idx_milestones_project;
DROP INDEX IF EXISTS idx_milestones_status;
DROP INDEX IF EXISTS idx_milestones_due_date;
DROP INDEX IF EXISTS idx_milestones_created_by;

DROP INDEX IF EXISTS idx_tasks_project;
DROP INDEX IF EXISTS idx_tasks_milestone;
DROP INDEX IF EXISTS idx_tasks_assigned;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_priority;
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_tasks_parent;
DROP INDEX IF EXISTS idx_tasks_created_by;

DROP INDEX IF EXISTS idx_comments_user;
DROP INDEX IF EXISTS idx_comments_task;
DROP INDEX IF EXISTS idx_comments_project;
DROP INDEX IF EXISTS idx_comments_milestone;
DROP INDEX IF EXISTS idx_comments_created;

DROP INDEX IF EXISTS idx_attachments_user;
DROP INDEX IF EXISTS idx_attachments_task;
DROP INDEX IF EXISTS idx_attachments_project;
DROP INDEX IF EXISTS idx_attachments_milestone;
DROP INDEX IF EXISTS idx_attachments_comment;
DROP INDEX IF EXISTS idx_attachments_mime;

DROP INDEX IF EXISTS idx_project_members_project;
DROP INDEX IF EXISTS idx_project_members_user;

DROP INDEX IF EXISTS idx_time_logs_user;
DROP INDEX IF EXISTS idx_time_logs_task;
DROP INDEX IF EXISTS idx_time_logs_project;
DROP INDEX IF EXISTS idx_time_logs_date;

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS time_logs CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Drop UUID extension (optional - will fail if other extensions depend on it)
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- Completion message
DO $$
BEGIN
    RAISE NOTICE 'Migration down completed successfully!';
    RAISE NOTICE 'All tables, indexes, triggers, and functions have been removed.';
    RAISE NOTICE 'Database has been reset to initial state.';
END $$; 