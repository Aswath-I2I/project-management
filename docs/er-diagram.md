# Project Management Platform - Entity Relationship Diagram

## Database Schema Overview

This ER diagram shows the complete database structure for the project management platform, including all entities, relationships, and key attributes.

## ER Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        text avatar_url
        varchar phone
        boolean is_active
        boolean is_verified
        timestamp last_login
        timestamp created_at
        timestamp updated_at
    }

    ROLES {
        uuid id PK
        varchar name UK
        text description
        jsonb permissions
        timestamp created_at
        timestamp updated_at
    }

    USER_ROLES {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
        uuid project_id FK
        timestamp created_at
    }

    PROJECTS {
        uuid id PK
        varchar name
        text description
        varchar status
        varchar priority
        date start_date
        date end_date
        decimal budget
        uuid owner_id FK
        timestamp created_at
        timestamp updated_at
    }

    MILESTONES {
        uuid id PK
        uuid project_id FK
        varchar name
        text description
        varchar status
        date start_date
        date end_date
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    TASKS {
        uuid id PK
        uuid project_id FK
        uuid milestone_id FK
        varchar title
        text description
        varchar status
        varchar priority
        varchar type
        decimal estimated_hours
        decimal actual_hours
        timestamp due_date
        uuid assigned_to FK
        uuid created_by FK
        uuid parent_task_id FK
        timestamp created_at
        timestamp updated_at
    }

    COMMENTS {
        uuid id PK
        text content
        uuid user_id FK
        uuid project_id FK
        uuid task_id FK
        uuid milestone_id FK
        uuid parent_comment_id FK
        boolean is_edited
        timestamp created_at
        timestamp updated_at
    }

    ATTACHMENTS {
        uuid id PK
        varchar filename
        varchar original_filename
        text file_path
        bigint file_size
        varchar mime_type
        uuid user_id FK
        uuid project_id FK
        uuid task_id FK
        uuid milestone_id FK
        uuid comment_id FK
        timestamp created_at
    }

    TIME_LOGS {
        uuid id PK
        uuid user_id FK
        uuid task_id FK
        uuid project_id FK
        text description
        decimal hours_spent
        date date
        time start_time
        time end_time
        boolean is_billable
        timestamp created_at
        timestamp updated_at
    }

    PROJECT_MEMBERS {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        timestamp joined_at
    }

    TASK_WATCHERS {
        uuid id PK
        uuid task_id FK
        uuid user_id FK
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        varchar title
        text message
        varchar type
        boolean is_read
        varchar related_entity_type
        uuid related_entity_id
        timestamp created_at
    }

    ACTIVITY_LOGS {
        uuid id PK
        uuid user_id FK
        varchar action
        varchar entity_type
        uuid entity_id
        jsonb old_values
        jsonb new_values
        inet ip_address
        text user_agent
        timestamp created_at
    }

    SETTINGS {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        varchar setting_key
        jsonb setting_value
        timestamp created_at
        timestamp updated_at
    }

    %% Relationships

    %% Users and Roles (Many-to-Many)
    USERS ||--o{ USER_ROLES : "has"
    ROLES ||--o{ USER_ROLES : "assigned_to"

    %% Projects and Users
    USERS ||--o{ PROJECTS : "owns"
    USERS ||--o{ PROJECT_MEMBERS : "member_of"
    PROJECTS ||--o{ PROJECT_MEMBERS : "has_members"

    %% Projects and Milestones (One-to-Many)
    PROJECTS ||--o{ MILESTONES : "contains"

    %% Projects and Tasks (One-to-Many)
    PROJECTS ||--o{ TASKS : "contains"

    %% Milestones and Tasks (One-to-Many)
    MILESTONES ||--o{ TASKS : "contains"

    %% Tasks and Subtasks (Self-Referencing)
    TASKS ||--o{ TASKS : "has_subtasks"

    %% Users and Tasks
    USERS ||--o{ TASKS : "assigned_to"
    USERS ||--o{ TASKS : "created_by"

    %% Users and Milestones
    USERS ||--o{ MILESTONES : "created_by"

    %% Tasks and Watchers (Many-to-Many)
    TASKS ||--o{ TASK_WATCHERS : "watched_by"
    USERS ||--o{ TASK_WATCHERS : "watches"

    %% Comments Relationships
    USERS ||--o{ COMMENTS : "writes"
    PROJECTS ||--o{ COMMENTS : "has_comments"
    TASKS ||--o{ COMMENTS : "has_comments"
    MILESTONES ||--o{ COMMENTS : "has_comments"
    COMMENTS ||--o{ COMMENTS : "has_replies"

    %% Attachments Relationships
    USERS ||--o{ ATTACHMENTS : "uploads"
    PROJECTS ||--o{ ATTACHMENTS : "has_attachments"
    TASKS ||--o{ ATTACHMENTS : "has_attachments"
    MILESTONES ||--o{ ATTACHMENTS : "has_attachments"
    COMMENTS ||--o{ ATTACHMENTS : "has_attachments"

    %% Time Logs Relationships
    USERS ||--o{ TIME_LOGS : "logs_time"
    TASKS ||--o{ TIME_LOGS : "has_time_logs"
    PROJECTS ||--o{ TIME_LOGS : "has_time_logs"

    %% Notifications
    USERS ||--o{ NOTIFICATIONS : "receives"

    %% Activity Logs
    USERS ||--o{ ACTIVITY_LOGS : "performs"

    %% Settings
    USERS ||--o{ SETTINGS : "has_settings"
    PROJECTS ||--o{ SETTINGS : "has_settings"
```

## Key Relationships Explained

### 1. **User Management**
- **Users ↔ Roles**: Many-to-many relationship through `user_roles` table
- **Users ↔ Projects**: One-to-many (ownership) and many-to-many (membership) through `project_members`

### 2. **Project Hierarchy**
- **Projects → Milestones**: One-to-many relationship
- **Projects → Tasks**: One-to-many relationship
- **Milestones → Tasks**: One-to-many relationship
- **Tasks → Subtasks**: Self-referencing one-to-many relationship

### 3. **Task Management**
- **Users ↔ Tasks**: Many-to-many through assignment and creation
- **Tasks ↔ Watchers**: Many-to-many relationship through `task_watchers`

### 4. **Content Management**
- **Comments**: Can be attached to projects, tasks, or milestones
- **Attachments**: Can be attached to projects, tasks, milestones, or comments
- **Comments**: Support nested replies through self-referencing

### 5. **Time Tracking**
- **Time Logs**: Linked to both tasks and projects for comprehensive tracking
- **Billable Hours**: Track whether time is billable to clients

### 6. **Audit and Notifications**
- **Activity Logs**: Track all user actions for audit purposes
- **Notifications**: System-wide notification system
- **Settings**: User and project-specific configurations

## Data Types and Constraints

### **Primary Keys**
- All tables use UUID primary keys for security and scalability
- UUIDs are generated using `uuid_generate_v4()` function

### **Foreign Keys**
- Proper CASCADE and RESTRICT rules for data integrity
- NULL allowed for optional relationships (e.g., unassigned tasks)

### **Check Constraints**
- Status fields have predefined valid values
- Priority fields have predefined levels
- Entity relationship constraints ensure proper associations

### **Indexes**
- Performance indexes on frequently queried columns
- Composite indexes for complex queries
- Foreign key indexes for join performance

### **Triggers**
- Automatic `updated_at` timestamp updates
- Audit trail maintenance
- Data validation triggers

## Database Features

### **PostgreSQL Specific Features**
- JSONB for flexible data storage (permissions, settings)
- INET type for IP address storage
- Full-text search capabilities
- Advanced indexing strategies

### **pgAdmin4 Compatibility**
- Proper comments for all tables and columns
- Standard PostgreSQL data types
- Compatible with pgAdmin4's schema browser
- Export/import friendly structure

### **Scalability Considerations**
- UUID primary keys for distributed systems
- Proper indexing for large datasets
- Partitioning-ready structure
- Efficient query patterns

This ER diagram provides a complete foundation for a robust project management platform with proper relationships, data integrity, and performance optimization. 