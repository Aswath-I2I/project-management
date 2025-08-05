-- Project Management System - Seed Data
-- This file contains sample data for testing and development

-- ============================================================================
-- SEED DATA FOR ALL TABLES
-- ============================================================================

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'System Administrator'),
('550e8400-e29b-41d4-a716-446655440002', 'project_manager', 'Project Manager'),
('550e8400-e29b-41d4-a716-446655440003', 'developer', 'Developer'),
('550e8400-e29b-41d4-a716-446655440004', 'viewer', 'Viewer');

-- Insert sample users (password hash is 'password123' for all users)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, avatar_url, phone, is_active, is_verified) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=A', '+1234567890', true, true),
('660e8400-e29b-41d4-a716-446655440002', 'john.doe', 'john.doe@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=J', '+1234567891', true, true),
('660e8400-e29b-41d4-a716-446655440003', 'jane.smith', 'jane.smith@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=J', '+1234567892', true, true),
('660e8400-e29b-41d4-a716-446655440004', 'mike.wilson', 'mike.wilson@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike', 'Wilson', 'https://via.placeholder.com/150/96CEB4/FFFFFF?text=M', '+1234567893', true, true),
('660e8400-e29b-41d4-a716-446655440005', 'sarah.johnson', 'sarah.johnson@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Johnson', 'https://via.placeholder.com/150/FFEAA7/FFFFFF?text=S', '+1234567894', true, true),
('660e8400-e29b-41d4-a716-446655440006', 'david.brown', 'david.brown@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David', 'Brown', 'https://via.placeholder.com/150/DDA0DD/FFFFFF?text=D', '+1234567895', true, true);

-- Insert user roles
INSERT INTO user_roles (id, user_id, role_id, project_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NULL),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', NULL),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', NULL),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', NULL),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', NULL),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', NULL);

-- Insert sample projects
INSERT INTO projects (id, name, description, status, priority, start_date, end_date, budget, created_by) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'E-commerce Website Redesign', 'Complete redesign of the company e-commerce platform with modern UI/UX and improved performance', 'active', 'high', '2024-01-15', '2024-06-30', 50000.00, '660e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440002', 'Mobile App Development', 'Development of a cross-platform mobile application for iOS and Android', 'active', 'medium', '2024-02-01', '2024-08-15', 75000.00, '660e8400-e29b-41d4-a716-446655440003'),
('880e8400-e29b-41d4-a716-446655440003', 'Database Migration', 'Migration from legacy database system to PostgreSQL with data integrity checks', 'on_hold', 'low', '2024-03-01', '2024-05-30', 25000.00, '660e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440004', 'Security Audit', 'Comprehensive security audit and vulnerability assessment of all systems', 'completed', 'urgent', '2024-01-01', '2024-02-28', 15000.00, '660e8400-e29b-41d4-a716-446655440001');

-- Insert project members
INSERT INTO project_members (id, project_id, user_id) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002'),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003'),
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004'),
('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003'),
('990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005'),
('990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004'),
('990e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440006'),
('990e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440009', '880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002');

-- Insert milestones
INSERT INTO milestones (id, project_id, name, description, status, due_date, completion_percentage, created_by) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Design Phase', 'Complete UI/UX design and wireframes', 'completed', '2024-02-15', 100, '660e8400-e29b-41d4-a716-446655440002'),
('aa0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Frontend Development', 'Implement responsive frontend components', 'in_progress', '2024-04-30', 65, '660e8400-e29b-41d4-a716-446655440003'),
('aa0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'Backend API', 'Develop RESTful API endpoints', 'in_progress', '2024-05-15', 45, '660e8400-e29b-41d4-a716-446655440004'),
('aa0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 'Testing & Deployment', 'Comprehensive testing and production deployment', 'pending', '2024-06-30', 0, '660e8400-e29b-41d4-a716-446655440002'),
('aa0e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', 'Planning & Design', 'Project planning and UI/UX design', 'completed', '2024-03-01', 100, '660e8400-e29b-41d4-a716-446655440003'),
('aa0e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002', 'Core Development', 'Core app functionality development', 'in_progress', '2024-06-30', 30, '660e8400-e29b-41d4-a716-446655440005'),
('aa0e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440003', 'Data Analysis', 'Analyze existing data structure', 'completed', '2024-03-15', 100, '660e8400-e29b-41d4-a716-446655440004'),
('aa0e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440004', 'Vulnerability Assessment', 'Identify security vulnerabilities', 'completed', '2024-02-15', 100, '660e8400-e29b-41d4-a716-446655440001');

-- Insert tasks
INSERT INTO tasks (id, project_id, milestone_id, title, description, status, priority, type, estimated_hours, actual_hours, progress_percentage, due_date, assigned_to, created_by) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'Create Wireframes', 'Design wireframes for all pages', 'completed', 'high', 'task', 16.0, 18.0, 100, '2024-02-10', '660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002'),
('bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'Design System', 'Create comprehensive design system', 'completed', 'high', 'task', 24.0, 22.0, 100, '2024-02-15', '660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002'),
('bb0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440002', 'Homepage Component', 'Build responsive homepage component', 'in_progress', 'high', 'task', 12.0, 8.0, 65, '2024-04-15', '660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002'),
('bb0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440002', 'Product Catalog', 'Implement product catalog with filters', 'in_progress', 'medium', 'task', 20.0, 12.0, 60, '2024-04-30', '660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002'),
('bb0e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440003', 'User Authentication API', 'Develop JWT-based authentication', 'in_progress', 'high', 'task', 16.0, 10.0, 45, '2024-05-10', '660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002'),
('bb0e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440003', 'Payment Integration', 'Integrate payment gateway', 'todo', 'high', 'task', 24.0, 0.0, 0, '2024-05-20', '660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002'),
('bb0e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440005', 'App Architecture', 'Design app architecture and tech stack', 'completed', 'high', 'task', 8.0, 6.0, 100, '2024-02-28', '660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003'),
('bb0e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440006', 'User Authentication', 'Implement user login/register', 'in_progress', 'high', 'task', 12.0, 8.0, 30, '2024-05-15', '660e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003'),
('bb0e8400-e29b-41d4-a716-446655440009', '880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440006', 'Core Features', 'Implement main app features', 'todo', 'medium', 'task', 40.0, 0.0, 0, '2024-07-30', '660e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003'),
('bb0e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440007', 'Data Mapping', 'Map existing data structure', 'completed', 'medium', 'task', 16.0, 14.0, 100, '2024-03-10', '660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002'),
('bb0e8400-e29b-41d4-a716-446655440011', '880e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440008', 'Penetration Testing', 'Conduct penetration testing', 'completed', 'urgent', 'task', 20.0, 18.0, 100, '2024-02-10', '660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001');

-- Insert comments
INSERT INTO comments (id, content, user_id, task_id, project_id, milestone_id, parent_comment_id, is_edited, created_at) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'Great work on the wireframes! The layout looks clean and user-friendly.', '660e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440001', NULL, NULL, NULL, false, '2024-02-10 14:30:00'),
('cc0e8400-e29b-41d4-a716-446655440002', 'Thanks! I think we should add a few more micro-interactions to improve the UX.', '660e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'cc0e8400-e29b-41d4-a716-446655440001', false, '2024-02-10 15:15:00'),
('cc0e8400-e29b-41d4-a716-446655440003', 'The homepage component is coming along nicely. Should we add dark mode support?', '660e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440003', NULL, NULL, NULL, false, '2024-04-05 10:20:00'),
('cc0e8400-e29b-41d4-a716-446655440004', 'Dark mode would be great! I can help implement that once the basic structure is done.', '660e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', NULL, NULL, 'cc0e8400-e29b-41d4-a716-446655440003', false, '2024-04-05 11:00:00'),
('cc0e8400-e29b-41d4-a716-446655440005', 'Authentication API is working well. We should add rate limiting for security.', '660e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440005', NULL, NULL, NULL, false, '2024-05-05 16:45:00');

-- Insert attachments
INSERT INTO attachments (id, filename, original_filename, file_path, file_size, mime_type, user_id, task_id, project_id, milestone_id, comment_id, created_at) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'wireframes_v1.pdf', 'wireframes_v1.pdf', '/uploads/wireframes_v1.pdf', 2048576, 'application/pdf', '660e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', NULL, NULL, NULL, '2024-02-10 14:00:00'),
('dd0e8400-e29b-41d4-a716-446655440002', 'design_system.sketch', 'design_system.sketch', '/uploads/design_system.sketch', 5120000, 'application/octet-stream', '660e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440002', NULL, NULL, NULL, '2024-02-15 09:30:00'),
('dd0e8400-e29b-41d4-a716-446655440003', 'homepage_mockup.png', 'homepage_mockup.png', '/uploads/homepage_mockup.png', 1024000, 'image/png', '660e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', NULL, NULL, NULL, '2024-04-05 10:00:00'),
('dd0e8400-e29b-41d4-a716-446655440004', 'api_documentation.md', 'api_documentation.md', '/uploads/api_documentation.md', 51200, 'text/markdown', '660e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440005', NULL, NULL, NULL, '2024-05-05 16:00:00');

-- Insert time logs
INSERT INTO time_logs (id, user_id, task_id, project_id, description, hours_spent, date, is_billable, created_at) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Created initial wireframes for homepage and product pages', 4.5, '2024-02-10', true, '2024-02-10 13:30:00'),
('ee0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Refined wireframes based on feedback', 3.0, '2024-02-11', true, '2024-02-11 13:00:00'),
('ee0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Designed color palette and typography system', 6.0, '2024-02-15', true, '2024-02-15 15:00:00'),
('ee0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'Built responsive homepage component with React', 4.0, '2024-04-05', true, '2024-04-05 13:00:00'),
('ee0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 'Implemented product catalog with filtering', 5.5, '2024-04-06', true, '2024-04-06 15:30:00'),
('ee0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001', 'Developed JWT authentication endpoints', 4.0, '2024-05-05', true, '2024-05-05 18:00:00'),
('ee0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440002', 'Implemented user authentication for mobile app', 3.5, '2024-05-10', true, '2024-05-10 12:30:00'),
('ee0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440003', 'Analyzed existing database structure', 7.0, '2024-03-10', true, '2024-03-10 15:00:00'),
('ee0e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440011', '880e8400-e29b-41d4-a716-446655440004', 'Conducted security penetration testing', 8.0, '2024-02-10', true, '2024-02-10 17:00:00');

-- Insert task watchers
INSERT INTO task_watchers (id, task_id, user_id, created_at) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', '2024-04-05 10:00:00'),
('ff0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', '2024-05-05 16:00:00'),
('ff0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', '2024-05-10 09:00:00');

-- Insert notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, related_entity_type, related_entity_id, created_at) VALUES
('110e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'Task Assigned', 'You have been assigned to "Create Wireframes" task', 'info', false, 'task', 'bb0e8400-e29b-41d4-a716-446655440001', '2024-02-10 09:00:00'),
('110e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'Task Assigned', 'You have been assigned to "Product Catalog" task', 'info', false, 'task', 'bb0e8400-e29b-41d4-a716-446655440004', '2024-04-06 10:00:00'),
('110e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'Milestone Completed', 'Design Phase milestone has been completed', 'success', false, 'milestone', 'aa0e8400-e29b-41d4-a716-446655440001', '2024-02-15 15:00:00'),
('110e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Project Completed', 'Security Audit project has been completed', 'success', false, 'project', '880e8400-e29b-41d4-a716-446655440004', '2024-02-28 17:00:00'),
('110e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 'Comment Added', 'John Doe commented on "Create Wireframes" task', 'info', false, 'task', 'bb0e8400-e29b-41d4-a716-446655440001', '2024-02-10 14:30:00');

-- Insert activity logs
INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) VALUES
('120e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'project_created', 'project', '880e8400-e29b-41d4-a716-446655440001', NULL, '{"name": "E-commerce Website Redesign", "status": "active"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-01-15 10:00:00'),
('120e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'task_created', 'task', 'bb0e8400-e29b-41d4-a716-446655440001', NULL, '{"title": "Create Wireframes", "status": "todo"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-02-10 09:00:00'),
('120e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'task_status_updated', 'task', 'bb0e8400-e29b-41d4-a716-446655440001', '{"status": "todo"}', '{"status": "completed"}', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-02-15 15:00:00'),
('120e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 'comment_added', 'comment', 'cc0e8400-e29b-41d4-a716-446655440001', NULL, '{"content": "Great work on the wireframes!"}', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-02-10 14:30:00'),
('120e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'project_completed', 'project', '880e8400-e29b-41d4-a716-446655440004', '{"status": "active"}', '{"status": "completed"}', '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-02-28 17:00:00');

-- Insert settings
INSERT INTO settings (id, user_id, project_id, setting_key, setting_value, created_at, updated_at) VALUES
('130e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', NULL, 'notifications', '{"email": true, "push": true, "sms": false}', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('130e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', NULL, 'theme', '{"mode": "light", "primary_color": "#4ECDC4"}', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('130e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', NULL, 'notifications', '{"email": true, "push": false, "sms": false}', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('130e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', NULL, 'project_settings', '{"auto_assign": true, "require_approval": false, "time_tracking": true}', '2024-01-15 10:00:00', '2024-01-15 10:00:00'),
('130e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', NULL, 'project_settings', '{"auto_assign": false, "require_approval": true, "time_tracking": true}', '2024-02-01 09:00:00', '2024-02-01 09:00:00');

-- ============================================================================
-- SEED DATA SUMMARY
-- ============================================================================

-- Summary of inserted data:
-- 4 roles (admin, project_manager, developer, viewer)
-- 6 users (admin, john.doe, jane.smith, mike.wilson, sarah.johnson, david.brown)
-- 6 user role assignments
-- 4 projects (E-commerce Website, Mobile App, Database Migration, Security Audit)
-- 9 project member assignments
-- 8 milestones across projects
-- 11 tasks with various statuses and priorities
-- 6 comments with nested replies
-- 4 file attachments
-- 9 time log entries
-- 3 task watchers
-- 5 notifications
-- 5 activity log entries
-- 5 user/project settings

-- All users have password: 'password123'
-- All UUIDs are pre-generated for consistency
-- Data spans from January to May 2024 for realistic timeline
-- Includes various task statuses, priorities, and progress levels
-- Realistic time tracking with billable hours
-- Sample comments and attachments for testing
-- Activity logging for audit trails
-- User settings and project configurations 