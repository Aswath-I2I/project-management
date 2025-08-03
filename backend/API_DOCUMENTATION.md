# Project Management System API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Authentication APIs](#authentication-apis)
  - [Project APIs](#project-apis)
  - [Milestone APIs](#milestone-apis)
  - [Task APIs](#task-apis)
  - [Team Management APIs](#team-management-apis)
  - [Comment APIs](#comment-apis)
  - [Time Tracking APIs](#time-tracking-apis)
- [Data Models](#data-models)
- [Examples](#examples)

## Overview

The Project Management System API provides a comprehensive RESTful interface for managing projects, tasks, milestones, team members, comments, and time tracking. The API uses JWT authentication and follows REST conventions.

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Base URL

```
http://localhost:3000/api
```

## Error Handling

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## API Endpoints

### Authentication APIs

#### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "john.doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true
    },
    "token": "jwt-token"
  }
}
```

#### Login User
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "john.doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true
    },
    "token": "jwt-token"
  }
}
```

#### Get User Profile
**GET** `/auth/me`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "john.doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "phone": "+1234567890",
    "is_active": true,
    "is_verified": true,
    "last_login": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "roles": ["developer", "project_manager"]
  }
}
```

#### Update User Profile
**PUT** `/auth/profile`

Update current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

#### Change Password
**POST** `/auth/change-password`

Change user's password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

#### Upload Avatar
**POST** `/auth/upload-avatar`

Upload user's profile picture.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `avatar` (file) - Image file (JPG, PNG, GIF, etc., max 5MB)

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "id": "uuid",
    "username": "john.doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "avatar_url": "http://localhost:3000/uploads/avatar-uuid-1234567890.jpg",
    "phone": "+1234567890",
    "is_active": true,
    "is_verified": true,
    "last_login": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Project APIs

#### Get All Projects
**GET** `/projects`

Get paginated list of projects with filtering options.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `status` (string) - Filter by status (active, completed, on_hold, cancelled)
- `priority` (string) - Filter by priority (low, medium, high, urgent)
- `search` (string) - Search in project name and description

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "E-commerce Website",
      "description": "Build modern e-commerce platform",
      "status": "active",
      "priority": "high",
      "start_date": "2024-01-01",
      "end_date": "2024-06-30",
      "budget": 50000.00,
      "created_by": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "creator_first_name": "John",
      "creator_last_name": "Doe",
      "milestones_count": 5,
      "tasks_count": 25,
      "team_members_count": 8,
      "completed_tasks_count": 15,
      "progress_percentage": 60
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Project by ID
**GET** `/projects/{id}`

Get detailed project information including milestones and team members.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "E-commerce Website",
    "description": "Build modern e-commerce platform",
    "status": "active",
    "priority": "high",
    "start_date": "2024-01-01",
    "end_date": "2024-06-30",
    "budget": 50000.00,
    "created_by": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "creator_first_name": "John",
    "creator_last_name": "Doe",
    "milestones": [
      {
        "id": "uuid",
        "name": "Design Phase",
        "description": "Complete UI/UX design",
        "status": "completed",
        "due_date": "2024-02-15",
        "completion_percentage": 100,
        "tasks_count": 8,
        "completed_tasks_count": 8
      }
    ],
    "team_members": [
      {
        "id": "uuid",
        "username": "john.doe",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_url": "https://example.com/avatar.jpg",
        "project_role": "project_manager",
        "global_roles": ["admin"],
        "assigned_tasks_count": 5,
        "completed_tasks_count": 3
      }
    ],
    "tasks_summary": {
      "total_tasks": 25,
      "completed_tasks": 15,
      "in_progress_tasks": 8,
      "todo_tasks": 2,
      "high_priority_tasks": 5
    },
    "progress_percentage": 60
  }
}
```

#### Create Project
**POST** `/projects`

Create a new project.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "E-commerce Website",
  "description": "Build modern e-commerce platform with React and Node.js",
  "status": "active",
  "priority": "high",
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "budget": 50000.00
}
```

#### Update Project
**PUT** `/projects/{id}`

Update project information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated E-commerce Website",
  "description": "Updated description",
  "status": "on_hold",
  "priority": "medium"
}
```

#### Delete Project
**DELETE** `/projects/{id}`

Delete a project (only project managers and admins).

**Headers:**
```
Authorization: Bearer <token>
```

#### Get Project Statistics
**GET** `/projects/{id}/stats`

Get project statistics and metrics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_milestones": 5,
    "completed_milestones": 3,
    "total_tasks": 25,
    "completed_tasks": 15,
    "team_size": 8,
    "total_hours": 240.5,
    "total_comments": 45,
    "total_attachments": 12
  }
}
```

---

### Milestone APIs

#### Get Project Milestones
**GET** `/milestones/project/{projectId}`

Get all milestones for a specific project.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "name": "Design Phase",
      "description": "Complete UI/UX design and wireframes",
      "status": "completed",
      "due_date": "2024-02-15",
      "completion_percentage": 100,
      "created_by": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-02-15T00:00:00Z",
      "creator_first_name": "John",
      "creator_last_name": "Doe",
      "tasks_count": 8,
      "completed_tasks_count": 8,
      "total_estimated_hours": 64.0,
      "total_actual_hours": 72.0,
      "progress_percentage": 100
    }
  ]
}
```

#### Get Milestone by ID
**GET** `/milestones/{id}`

Get detailed milestone information including tasks.

**Headers:**
```
Authorization: Bearer <token>
```

#### Create Milestone
**POST** `/milestones`

Create a new milestone.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "project_id": "uuid",
  "name": "Development Phase",
  "description": "Core development and implementation",
  "status": "pending",
  "due_date": "2024-04-30",
  "completion_percentage": 0
}
```

#### Update Milestone
**PUT** `/milestones/{id}`

Update milestone information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Development Phase",
  "description": "Updated description",
  "status": "in_progress",
  "completion_percentage": 50
}
```

#### Update Milestone Status
**PATCH** `/milestones/{id}/status`

Update milestone status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "completed"
}
```

#### Delete Milestone
**DELETE** `/milestones/{id}`

Delete a milestone (only project managers and admins).

**Headers:**
```
Authorization: Bearer <token>
```

#### Get Milestone Statistics
**GET** `/milestones/{id}/stats`

Get milestone statistics.

**Headers:**
```
Authorization: Bearer <token>
```

#### Get Overdue Milestones
**GET** `/milestones/overdue`

Get overdue milestones for current user.

**Headers:**
```
Authorization: Bearer <token>
```

#### Get Upcoming Milestones
**GET** `/milestones/upcoming`

Get upcoming milestones for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (number, default: 7) - Number of days to look ahead

---

### Task APIs

#### Get Project Tasks
**GET** `/tasks/project/{projectId}`

Get all tasks for a specific project with filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string) - Filter by status
- `priority` (string) - Filter by priority
- `assigned_to` (string) - Filter by assigned user
- `milestone_id` (string) - Filter by milestone
- `search` (string) - Search in task title and description

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "milestone_id": "uuid",
      "title": "Design Homepage",
      "description": "Create responsive homepage design",
      "status": "in_progress",
      "priority": "high",
      "type": "task",
      "estimated_hours": 16.0,
      "actual_hours": 12.0,
      "progress_percentage": 75,
      "due_date": "2024-02-15T00:00:00Z",
      "assigned_to": "uuid",
      "created_by": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "assigned_first_name": "John",
      "assigned_last_name": "Doe",
      "assigned_username": "john.doe",
      "milestone_name": "Design Phase",
      "project_name": "E-commerce Website",
      "comments_count": 5,
      "attachments_count": 2,
      "total_time_spent": 12.0
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Task by ID
**GET** `/tasks/{id}`

Get detailed task information including subtasks.

**Headers:**
```
Authorization: Bearer <token>
```

#### Create Task
**POST** `/tasks`

Create a new task.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "project_id": "uuid",
  "milestone_id": "uuid",
  "title": "Implement User Authentication",
  "description": "Create JWT-based authentication system",
  "status": "todo",
  "priority": "high",
  "type": "feature",
  "estimated_hours": 24.0,
  "due_date": "2024-03-01T00:00:00Z",
  "assigned_to": "uuid",
  "parent_task_id": "uuid"
}
```

**Status Values:**
- `todo` - Task is created but not started
- `in_progress` - Task is currently being worked on
- `review` - Task is completed and awaiting review
- `completed` - Task is finished and approved
- `closed` - Task is closed (no longer active)
- `cancelled` - Task has been cancelled

#### Update Task
**PUT** `/tasks/{id}`

Update task information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "medium",
  "progress_percentage": 50
}
```

#### Assign Task
**PATCH** `/tasks/{id}/assign`

Assign task to a user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "assigned_to": "uuid"
}
```

#### Update Task Status
**PATCH** `/tasks/{id}/status`

Update task status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "completed"
}
```

#### Update Task Progress
**PATCH** `/tasks/{id}/progress`

Update task progress percentage.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "progress_percentage": 75
}
```

#### Delete Task
**DELETE** `/tasks/{id}`

Delete a task (only project managers and admins).

**Headers:**
```
Authorization: Bearer <token>
```

#### Get User's Assigned Tasks
**GET** `/tasks/user/assigned`

Get tasks assigned to current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `project_id` (string) - Filter by project
- `status` (string) - Filter by status
- `priority` (string) - Filter by priority

#### Get Overdue Tasks
**GET** `/tasks/overdue`

Get overdue tasks for current user.

**Headers:**
```
Authorization: Bearer <token>
```

---

### Team Management APIs

#### Get All Users
**GET** `/team/users`

Get all users (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string) - Search in username, email, first_name, last_name
- `is_active` (boolean) - Filter by active status
- `role` (string) - Filter by role

#### Get User by ID
**GET** `/team/users/{id}`

Get user information by ID.

**Headers:**
```
Authorization: Bearer <token>
```

#### Get Project Team
**GET** `/team/project/{projectId}`

Get all team members for a project.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "john.doe",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "email": "john@example.com",
      "project_role": "project_manager",
      "joined_at": "2024-01-01T00:00:00Z",
      "global_roles": ["admin"],
      "assigned_tasks_count": 5,
      "completed_tasks_count": 3
    }
  ]
}
```

#### Add User to Project
**POST** `/team/project/{projectId}/members`

Add a user to project team.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "role": "developer"
}
```

#### Update Member Role
**PUT** `/team/project/{projectId}/members/{userId}/role`

Update project member role.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "project_manager"
}
```

#### Remove User from Project
**DELETE** `/team/project/{projectId}/members/{userId}`

Remove user from project team.

**Headers:**
```
Authorization: Bearer <token>
```

#### Get User's Projects
**GET** `/team/user/projects`

Get all projects for current user.

**Headers:**
```
Authorization: Bearer <token>
```

#### Get User's Assigned Tasks
**GET** `/team/user/assigned-tasks`

Get tasks assigned to current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `project_id` (string) - Filter by project
- `status` (string) - Filter by status
- `priority` (string) - Filter by priority

#### Get User Statistics
**GET** `/team/user/stats`

Get user statistics and metrics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_projects": 5,
    "total_assigned_tasks": 25,
    "completed_tasks": 18,
    "in_progress_tasks": 5,
    "overdue_tasks": 2,
    "total_hours_logged": 120.5
  }
}
```

#### Get Current User Role in Project
**GET** `/team/project/{projectId}/current-user-role`

Get the current user's role in a specific project.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "project_id": "uuid",
    "role": "admin",
    "role_display_name": "Administrator",
    "permissions": {
      "can_edit_project": true,
      "can_delete_project": true,
      "can_add_members": true,
      "can_remove_members": true,
      "can_manage_tasks": true,
      "can_manage_milestones": true
    }
  }
}
```

---

### Comment APIs

#### Get Task Comments
**GET** `/comments/task/{taskId}`

Get all comments for a task.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Great work on the design!",
      "user_id": "uuid",
      "task_id": "uuid",
      "project_id": null,
      "milestone_id": null,
      "parent_comment_id": null,
      "is_edited": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "first_name": "John",
      "last_name": "Doe",
      "username": "john.doe",
      "attachments_count": 2,
      "attachments": [
        {
          "id": "uuid",
          "filename": "design-mockup.png",
          "original_filename": "design-mockup.png",
          "file_size": 1024000,
          "mime_type": "image/png",
          "created_at": "2024-01-15T10:30:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Get Project Comments
**GET** `/comments/project/{projectId}`

Get all comments for a project.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

#### Get Comment by ID
**GET** `/comments/{id}`

Get detailed comment information including replies and attachments.

**Headers:**
```
Authorization: Bearer <token>
```

#### Create Comment
**POST** `/comments`

Create a new comment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "This is a comment on the task",
  "task_id": "uuid",
  "parent_comment_id": "uuid"
}
```

#### Update Comment
**PUT** `/comments/{id}`

Update comment content.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

#### Delete Comment
**DELETE** `/comments/{id}`

Delete a comment.

**Headers:**
```
Authorization: Bearer <token>
```

---

### Time Tracking APIs

#### Log Time Entry
**POST** `/time/log`

Log time spent on a task or project.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "task_id": "uuid",
  "description": "Implemented user authentication system",
  "hours_spent": 4.5,
  "date": "2024-01-15",
  "start_time": "09:00:00",
  "end_time": "13:30:00",
  "is_billable": true
}
```

#### Update Time Log
**PUT** `/time/{id}`

Update time log entry.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "description": "Updated description",
  "hours_spent": 5.0,
  "is_billable": false
}
```

#### Delete Time Log
**DELETE** `/time/{id}`

Delete time log entry.

**Headers:**
```
Authorization: Bearer <token>
```

#### Get Task Time Logs
**GET** `/time/task/{taskId}`

Get time logs for a specific task.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `start_date` (string) - Filter by start date
- `end_date` (string) - Filter by end date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "task_id": "uuid",
      "project_id": null,
      "description": "Implemented user authentication",
      "hours_spent": 4.5,
      "date": "2024-01-15",
      "start_time": "09:00:00",
      "end_time": "13:30:00",
      "is_billable": true,
      "created_at": "2024-01-15T13:30:00Z",
      "first_name": "John",
      "last_name": "Doe",
      "username": "john.doe"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Get Project Time Logs
**GET** `/time/project/{projectId}`

Get time logs for a specific project.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `start_date` (string) - Filter by start date
- `end_date` (string) - Filter by end date
- `user_id` (string) - Filter by user

#### Get User's Time Logs
**GET** `/time/user/assigned`

Get time logs for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `start_date` (string) - Filter by start date
- `end_date` (string) - Filter by end date
- `project_id` (string) - Filter by project
- `task_id` (string) - Filter by task

#### Get Project Time Summary
**GET** `/time/project/{projectId}/summary`

Get time summary for a project.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (string) - Filter by start date
- `end_date` (string) - Filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "total_hours": 240.5,
    "billable_hours": 200.0,
    "non_billable_hours": 40.5,
    "users_count": 8,
    "tasks_count": 25,
    "entries_count": 150,
    "user_breakdown": [
      {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "username": "john.doe",
        "total_hours": 45.5,
        "billable_hours": 40.0,
        "entries_count": 25
      }
    ],
    "task_breakdown": [
      {
        "id": "uuid",
        "title": "Design Homepage",
        "total_hours": 16.0,
        "billable_hours": 16.0,
        "entries_count": 8
      }
    ]
  }
}
```

#### Get User's Timesheet
**GET** `/time/user/timesheet`

Get user's timesheet with daily, project, and task breakdowns.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (string) - Filter by start date
- `end_date` (string) - Filter by end date
- `project_id` (string) - Filter by project

**Response:**
```json
{
  "success": true,
  "data": {
    "daily_breakdown": [
      {
        "date": "2024-01-15",
        "total_hours": 8.0,
        "billable_hours": 7.5,
        "entries_count": 3
      }
    ],
    "project_breakdown": [
      {
        "id": "uuid",
        "name": "E-commerce Website",
        "total_hours": 45.5,
        "billable_hours": 40.0,
        "entries_count": 25
      }
    ],
    "task_breakdown": [
      {
        "id": "uuid",
        "title": "Design Homepage",
        "project_name": "E-commerce Website",
        "total_hours": 16.0,
        "billable_hours": 16.0,
        "entries_count": 8
      }
    ]
  }
}
```

---

## Data Models

### User
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "password_hash": "string",
  "first_name": "string",
  "last_name": "string",
  "avatar_url": "string",
  "phone": "string",
  "is_active": "boolean",
  "is_verified": "boolean",
  "last_login": "timestamp",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Project
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "status": "active|completed|on_hold|cancelled",
  "priority": "low|medium|high|urgent",
  "start_date": "date",
  "end_date": "date",
  "budget": "decimal",
  "created_by": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Milestone
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "string",
  "description": "string",
  "status": "pending|in_progress|completed|cancelled",
  "due_date": "date",
  "completion_percentage": "integer",
  "created_by": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Task
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "milestone_id": "uuid",
  "title": "string",
  "description": "string",
  "status": "todo|in_progress|review|completed|cancelled",
  "priority": "low|medium|high|urgent",
  "type": "task|bug|feature|story",
  "estimated_hours": "decimal",
  "actual_hours": "decimal",
  "progress_percentage": "integer",
  "due_date": "timestamp",
  "assigned_to": "uuid",
  "created_by": "uuid",
  "parent_task_id": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Comment
```json
{
  "id": "uuid",
  "content": "string",
  "user_id": "uuid",
  "task_id": "uuid",
  "project_id": "uuid",
  "milestone_id": "uuid",
  "parent_comment_id": "uuid",
  "is_edited": "boolean",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Time Log
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "task_id": "uuid",
  "project_id": "uuid",
  "description": "string",
  "hours_spent": "decimal",
  "date": "date",
  "start_time": "time",
  "end_time": "time",
  "is_billable": "boolean",
  "created_at": "timestamp"
}
```

---

## Examples

### Complete Workflow Example

1. **Register and Login**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "email": "john@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

2. **Create Project**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "E-commerce Website",
    "description": "Build modern e-commerce platform",
    "status": "active",
    "priority": "high",
    "start_date": "2024-01-01",
    "end_date": "2024-06-30",
    "budget": 50000
  }'
```

3. **Create Milestone**
```bash
curl -X POST http://localhost:5000/api/milestones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project_id": "project-uuid",
    "name": "Design Phase",
    "description": "Complete UI/UX design",
    "status": "pending",
    "due_date": "2024-02-15"
  }'
```

4. **Create Task**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "project_id": "project-uuid",
    "milestone_id": "milestone-uuid",
    "title": "Design Homepage",
    "description": "Create responsive homepage design",
    "priority": "high",
    "estimated_hours": 16,
    "due_date": "2024-02-15"
  }'
```

5. **Log Time**
```bash
curl -X POST http://localhost:5000/api/time/log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "task_id": "task-uuid",
    "description": "Created wireframes and mockups",
    "hours_spent": 4.5,
    "date": "2024-01-15",
    "is_billable": true
  }'
```

6. **Add Comment**
```bash
curl -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "task_id": "task-uuid",
    "content": "Design looks great! Ready for development."
  }'
```

This API documentation provides a comprehensive guide to all available endpoints, request/response formats, and usage examples for the Project Management System. 