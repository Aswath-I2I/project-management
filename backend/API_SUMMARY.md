# Project Management System - Complete API Summary

## Overview
This document provides a complete overview of all available APIs in the Project Management System.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication APIs (6 endpoints)

### User Management
- **POST** `/auth/register` - Register new user
- **POST** `/auth/login` - User login
- **GET** `/auth/me` - Get current user profile
- **PUT** `/auth/profile` - Update user profile
- **POST** `/auth/change-password` - Change user password
- **POST** `/auth/upload-avatar` - Upload profile picture

---

## 📋 Project APIs (6 endpoints)

### Project Management
- **GET** `/projects` - Get all projects (with pagination & filtering)
- **POST** `/projects` - Create new project
- **GET** `/projects/{id}` - Get project by ID
- **PUT** `/projects/{id}` - Update project
- **GET** `/projects/{id}/stats` - Get project statistics
- **DELETE** `/projects/{id}` - Delete project

---

## 🎯 Milestone APIs (8 endpoints)

### Milestone Management
- **GET** `/milestones/project/{projectId}` - Get project milestones
- **POST** `/milestones` - Create milestone
- **GET** `/milestones/{id}` - Get milestone by ID
- **PUT** `/milestones/{id}` - Update milestone
- **PATCH** `/milestones/{id}/status` - Update milestone status
- **GET** `/milestones/{id}/stats` - Get milestone statistics
- **DELETE** `/milestones/{id}` - Delete milestone
- **GET** `/milestones/overdue` - Get overdue milestones
- **GET** `/milestones/upcoming` - Get upcoming milestones

---

## ✅ Task APIs (9 endpoints)

### Task Management
- **GET** `/tasks/project/{projectId}` - Get project tasks
- **POST** `/tasks` - Create task
- **GET** `/tasks/{id}` - Get task by ID
- **PUT** `/tasks/{id}` - Update task
- **PATCH** `/tasks/{id}/assign` - Assign task to user
- **PATCH** `/tasks/{id}/status` - Update task status
- **PATCH** `/tasks/{id}/progress` - Update task progress
- **DELETE** `/tasks/{id}` - Delete task
- **GET** `/tasks/user/assigned` - Get user's assigned tasks
- **GET** `/tasks/overdue` - Get overdue tasks

---

## 👥 Team Management APIs (9 endpoints)

### Team & User Management
- **GET** `/team/users` - Get all users
- **GET** `/team/users/{id}` - Get user by ID
- **GET** `/team/project/{projectId}` - Get project team
- **POST** `/team/project/{projectId}/members` - Add user to project
- **PUT** `/team/project/{projectId}/members/{userId}/role` - Update member role
- **DELETE** `/team/project/{projectId}/members/{userId}` - Remove user from project
- **GET** `/team/user/projects` - Get user's projects
- **GET** `/team/user/assigned-tasks` - Get user's assigned tasks
- **GET** `/team/user/stats` - Get user statistics
- **GET** `/team/project/{projectId}/current-user-role` - Get current user's role in project

---

## 💬 Comment APIs (6 endpoints)

### Comment Management
- **GET** `/comments/task/{taskId}` - Get task comments
- **GET** `/comments/project/{projectId}` - Get project comments
- **GET** `/comments/{id}` - Get comment by ID
- **POST** `/comments` - Create comment
- **PUT** `/comments/{id}` - Update comment
- **DELETE** `/comments/{id}` - Delete comment

---

## ⏱️ Time Tracking APIs (8 endpoints)

### Time Management
- **POST** `/time/log` - Log time entry
- **PUT** `/time/{id}` - Update time log
- **DELETE** `/time/{id}` - Delete time log
- **GET** `/time/task/{taskId}` - Get task time logs
- **GET** `/time/project/{projectId}` - Get project time logs
- **GET** `/time/user/assigned` - Get user's time logs
- **GET** `/time/project/{projectId}/summary` - Get project time summary
- **GET** `/time/user/timesheet` - Get user's timesheet

---

## 🔧 System APIs (1 endpoint)

### System Health
- **GET** `/health` - Health check endpoint

---

## 📊 Total API Count: 52 Endpoints

### Breakdown by Category:
- **Authentication**: 6 endpoints
- **Projects**: 6 endpoints  
- **Milestones**: 8 endpoints
- **Tasks**: 9 endpoints
- **Team Management**: 9 endpoints
- **Comments**: 6 endpoints
- **Time Tracking**: 8 endpoints
- **System**: 1 endpoint

---

## 📁 File Upload Support

### Supported File Types:
- **Profile Pictures**: JPG, PNG, GIF, WebP
- **Maximum Size**: 5MB per file
- **Storage**: Local file system (`/uploads` directory)
- **Access**: Files served via `/uploads/{filename}`

---

## 🔒 Security Features

### Authentication & Authorization:
- JWT-based authentication
- Role-based access control (RBAC)
- Project-level permissions
- User session management

### Data Validation:
- Input sanitization
- File type validation
- File size limits
- SQL injection prevention

### Error Handling:
- Consistent error response format
- Detailed error messages (development)
- Generic error messages (production)
- Proper HTTP status codes

---

## 📚 Documentation Files

1. **API_DOCUMENTATION.md** - Detailed API documentation with examples
2. **Project_Management_API.postman_collection.json** - Postman collection for testing
3. **API_SUMMARY.md** - This summary document

---

## 🚀 Getting Started

1. **Import Postman Collection**: Use the provided JSON file
2. **Set Environment Variables**: Configure `baseUrl` and `authToken`
3. **Authenticate**: Use register/login endpoints to get a token
4. **Test APIs**: Use the collection to test all endpoints

---

*Last Updated: January 2024*
*Total Endpoints: 52* 