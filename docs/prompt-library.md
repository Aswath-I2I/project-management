# Prompt Library

## 1. Architecture Diagram Prompt

### System Architecture Design:
"Design a system architecture diagram for a project management platform using React.js for the frontend, Node.js for the backend, and PostgreSQL as the database. The diagram should illustrate major components (frontend, backend, database), flow between user actions, REST API endpoints, authentication, and auxiliary systems (notifications, file storage, real-time updates)."

## 2. Database Schema Design Prompt

### Entity-Relationship Design:
"Create a detailed entity-relationship (ER) diagram and table schemas for the following entities: Projects, Milestones, Tasks, Users, Comments, Attachments, Roles, TimeLogs. Specify primary and foreign keys, relationships (one-to-many, many-to-many), and data types for each field. Document how entities like time tracking, attachments, and user roles relate to their parent objects."

## 3. Database Design Prompts

### Projects Table:
"Design a PostgreSQL database table to store project information, including project name, description, created by, start and end dates, and status. Each project should support multiple milestones and be linked to a team."

### Milestones Table:
"Create a table structure for project milestones. Each milestone should be linked to a project, have a name, description, due date, and completion status."

### Tasks Table:
"Design a tasks table to support task assignment to team members. Fields should include task title, description, priority (e.g., Low, Medium, High), due date, status, assigned user, parent milestone, and progress indicators."

### Team Members & Roles:
"Devise tables for users/teammates and their roles (e.g., admin, manager, member). Users should be associated with projects and tasks."

### Comments & Attachments:
"Define tables for task comments and file attachments. Each comment should reference a task and user, include timestamp and content. Attachments should store the file path, associated task/comment, and uploader."

### Time Logs:
"Create a time tracking table to log hours spent by each user on a given task or project, including start/end timestamps, total hours, notes, and references to user and task/project."

## 4. API Endpoint Creation Prompts

### Project Endpoints:
"Define REST API endpoints for creating, updating, retrieving, and deleting projects. Include endpoints to fetch projects with their milestones and assigned team members."

### Milestone Endpoints:
"Create endpoints to add, update, delete, and list milestones for a specific project. Provide status update functionality for milestones."

### Task Endpoints:
"Provide endpoints to create, update, assign, reprioritize, and delete tasks. Allow fetching all tasks for a project, filter by user, and update the status/progress of tasks."

### Team/Users Endpoints:
"Describe endpoints to add team members to projects, manage user roles, and list all users assigned to a project."

### Comments & Attachments Endpoints:
"Specify endpoints for adding, editing, retrieving, and deleting comments on tasks, as well as uploading and listing attachments for tasks and comments."

### Time Tracking Endpoints:
"Detail endpoints to log time entries, update time logs, retrieve time spent per user/task/project, and allow users to view their timesheets."

### Notifications Endpoint (Optional):
"Design an endpoint for sending and retrieving notifications related to project updates, task status changes, new comments/attachments, etc."

## 5. Frontend Prompts (React.js)

### Project Dashboard Page:
"Implement a dashboard in React.js displaying all projects with their statuses, visual progress bars, and key milestones. Support searching and filtering by project attributes."

### Project & Milestone Detail View:
"Build pages for viewing project/milestone details, including timelines, current progress, list of tasks, team members, and recent activity feed."

### Task Management UI:
"Develop components for listing tasks, assigning/reassigning to users, setting priorities, editing details, updating status, and displaying progress (e.g., progress bars, status badges)."

### Task Detail & Collaboration:
"Create a task detail modal/page showing description, subtasks, comments section (with file attachments), time logs, and activity history. Enable adding new comments and attachments inline."

### Time Tracking Interface:
"Design a UI for logging time against tasks, viewing timesheets, and summarizing hours spent per user/project. Provide forms for adding/editing time logs."

### Notifications & Real-Time Updates:
"Integrate a notification system/UI to alert users of new comments, assignments, and status changes. Enable live updates on dashboards using WebSockets or polling."

### User Management Screens:
"Build user/team management pages to invite new members, assign roles, and view team composition for each project." 