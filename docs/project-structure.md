# Project Management System - Project Structure

## Overview
This document outlines the complete folder structure for the project management system, with separate frontend and backend code organization.

## Root Directory Structure
```
project-management-system/
├── backend/                    # Backend Node.js application
├── frontend/                   # Frontend React application
├── database/                   # Database scripts and migrations
├── docs/                       # Documentation
├── scripts/                    # Build and deployment scripts
└── README.md                   # Project overview
```

## Backend Structure (`backend/`)
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Database configuration
│   │   ├── auth.js            # Authentication configuration
│   │   ├── cors.js            # CORS configuration
│   │   └── environment.js     # Environment variables
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── projectController.js # Project management
│   │   ├── taskController.js   # Task management
│   │   ├── milestoneController.js # Milestone management
│   │   ├── userController.js   # User management
│   │   ├── commentController.js # Comment management
│   │   ├── attachmentController.js # File upload/download
│   │   ├── timeLogController.js # Time tracking
│   │   └── notificationController.js # Notifications
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── validation.js      # Request validation
│   │   ├── errorHandler.js    # Error handling
│   │   ├── logging.js         # Request logging
│   │   └── rateLimiter.js     # Rate limiting
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── Project.js         # Project model
│   │   ├── Milestone.js       # Milestone model
│   │   ├── Task.js            # Task model
│   │   ├── Comment.js         # Comment model
│   │   ├── Attachment.js      # Attachment model
│   │   ├── TimeLog.js         # Time log model
│   │   ├── Role.js            # Role model
│   │   └── Notification.js    # Notification model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── projects.js        # Project routes
│   │   ├── tasks.js           # Task routes
│   │   ├── milestones.js      # Milestone routes
│   │   ├── users.js           # User routes
│   │   ├── comments.js        # Comment routes
│   │   ├── attachments.js     # Attachment routes
│   │   ├── timeLogs.js        # Time log routes
│   │   └── notifications.js   # Notification routes
│   ├── services/
│   │   ├── authService.js     # Authentication service
│   │   ├── projectService.js  # Project business logic
│   │   ├── taskService.js     # Task business logic
│   │   ├── fileService.js     # File handling service
│   │   ├── emailService.js    # Email notifications
│   │   ├── notificationService.js # Notification logic
│   │   └── websocketService.js # Real-time updates
│   ├── utils/
│   │   ├── database.js        # Database utilities
│   │   ├── validation.js      # Validation utilities
│   │   ├── encryption.js      # Encryption utilities
│   │   ├── fileUpload.js      # File upload utilities
│   │   └── logger.js          # Logging utilities
│   └── app.js                 # Express app setup
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── projects.test.js
│   │   └── tasks.test.js
│   └── fixtures/
│       ├── users.json
│       ├── projects.json
│       └── tasks.json
├── uploads/                   # File upload directory
├── logs/                      # Application logs
├── package.json               # Backend dependencies
├── .env.example              # Environment variables example
├── .env                      # Environment variables (gitignored)
├── .gitignore
└── README.md                 # Backend documentation
```

## Frontend Structure (`frontend/`)
```
frontend/
├── public/
│   ├── index.html             # Main HTML file
│   ├── favicon.ico           # Favicon
│   ├── manifest.json         # PWA manifest
│   └── assets/
│       ├── images/
│       └── icons/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx    # Application header
│   │   │   ├── Sidebar.jsx   # Navigation sidebar
│   │   │   ├── Footer.jsx    # Application footer
│   │   │   ├── Loading.jsx   # Loading spinner
│   │   │   ├── Modal.jsx     # Modal component
│   │   │   ├── Button.jsx    # Reusable button
│   │   │   ├── Input.jsx     # Reusable input
│   │   │   └── Alert.jsx     # Alert/notification component
│   │   ├── auth/
│   │   │   ├── Login.jsx     # Login form
│   │   │   ├── Register.jsx  # Registration form
│   │   │   ├── ForgotPassword.jsx # Password reset
│   │   │   └── Profile.jsx   # User profile
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx # Main dashboard
│   │   │   ├── ProjectCard.jsx # Project summary card
│   │   │   ├── TaskCard.jsx  # Task summary card
│   │   │   ├── ActivityFeed.jsx # Recent activity
│   │   │   └── Statistics.jsx # Dashboard statistics
│   │   ├── projects/
│   │   │   ├── ProjectList.jsx # Project listing
│   │   │   ├── ProjectDetail.jsx # Project details
│   │   │   ├── ProjectForm.jsx # Create/edit project
│   │   │   ├── ProjectMembers.jsx # Team management
│   │   │   └── ProjectSettings.jsx # Project settings
│   │   ├── tasks/
│   │   │   ├── TaskList.jsx  # Task listing
│   │   │   ├── TaskDetail.jsx # Task details
│   │   │   ├── TaskForm.jsx  # Create/edit task
│   │   │   ├── TaskBoard.jsx # Kanban board view
│   │   │   ├── TaskCalendar.jsx # Calendar view
│   │   │   └── TaskFilters.jsx # Task filtering
│   │   ├── milestones/
│   │   │   ├── MilestoneList.jsx # Milestone listing
│   │   │   ├── MilestoneDetail.jsx # Milestone details
│   │   │   ├── MilestoneForm.jsx # Create/edit milestone
│   │   │   └── MilestoneProgress.jsx # Progress tracking
│   │   ├── comments/
│   │   │   ├── CommentList.jsx # Comment listing
│   │   │   ├── CommentForm.jsx # Add comment
│   │   │   └── CommentItem.jsx # Individual comment
│   │   ├── attachments/
│   │   │   ├── AttachmentList.jsx # File listing
│   │   │   ├── FileUpload.jsx # File upload component
│   │   │   └── FilePreview.jsx # File preview
│   │   ├── timeTracking/
│   │   │   ├── TimeLogForm.jsx # Time log entry
│   │   │   ├── TimeLogList.jsx # Time log listing
│   │   │   ├── TimeReport.jsx # Time reports
│   │   │   └── Timer.jsx      # Time tracking timer
│   │   └── notifications/
│   │       ├── NotificationList.jsx # Notification listing
│   │       ├── NotificationItem.jsx # Individual notification
│   │       └── NotificationSettings.jsx # Notification preferences
│   ├── pages/
│   │   ├── Dashboard.jsx      # Dashboard page
│   │   ├── Projects.jsx       # Projects page
│   │   ├── ProjectDetail.jsx  # Project detail page
│   │   ├── Tasks.jsx          # Tasks page
│   │   ├── TaskDetail.jsx     # Task detail page
│   │   ├── Milestones.jsx     # Milestones page
│   │   ├── Users.jsx          # User management page
│   │   ├── Reports.jsx        # Reports page
│   │   └── Settings.jsx       # Settings page
│   ├── hooks/
│   │   ├── useAuth.js         # Authentication hook
│   │   ├── useProjects.js     # Project data hook
│   │   ├── useTasks.js        # Task data hook
│   │   ├── useTimeLogs.js     # Time log hook
│   │   ├── useWebSocket.js    # WebSocket hook
│   │   └── useNotifications.js # Notification hook
│   ├── services/
│   │   ├── api.js             # API client
│   │   ├── auth.js            # Authentication service
│   │   ├── projects.js        # Project API service
│   │   ├── tasks.js           # Task API service
│   │   ├── milestones.js      # Milestone API service
│   │   ├── users.js           # User API service
│   │   ├── comments.js        # Comment API service
│   │   ├── attachments.js     # Attachment API service
│   │   ├── timeLogs.js        # Time log API service
│   │   └── notifications.js   # Notification API service
│   ├── store/
│   │   ├── index.js           # Redux store configuration
│   │   ├── slices/
│   │   │   ├── authSlice.js   # Authentication state
│   │   │   ├── projectSlice.js # Project state
│   │   │   ├── taskSlice.js   # Task state
│   │   │   ├── milestoneSlice.js # Milestone state
│   │   │   ├── userSlice.js   # User state
│   │   │   ├── commentSlice.js # Comment state
│   │   │   ├── attachmentSlice.js # Attachment state
│   │   │   ├── timeLogSlice.js # Time log state
│   │   │   └── notificationSlice.js # Notification state
│   │   └── middleware/
│   │       ├── websocket.js   # WebSocket middleware
│   │       └── logger.js      # Redux logger
│   ├── utils/
│   │   ├── constants.js       # Application constants
│   │   ├── helpers.js         # Utility functions
│   │   ├── validation.js      # Form validation
│   │   ├── dateUtils.js       # Date manipulation
│   │   ├── fileUtils.js       # File handling
│   │   └── permissions.js     # Permission checking
│   ├── styles/
│   │   ├── index.css          # Global styles
│   │   ├── components.css     # Component styles
│   │   ├── variables.css      # CSS variables
│   │   └── themes/
│   │       ├── light.css      # Light theme
│   │       └── dark.css       # Dark theme
│   ├── App.jsx                # Main application component
│   ├── index.jsx              # Application entry point
│   └── routes.jsx             # Application routing
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── projects.test.js
│   │   └── tasks.test.js
│   └── fixtures/
│       ├── users.json
│       ├── projects.json
│       └── tasks.json
├── package.json               # Frontend dependencies
├── .env.example              # Environment variables example
├── .env                      # Environment variables (gitignored)
├── .gitignore
└── README.md                 # Frontend documentation
```

## Database Structure (`database/`)
```
database/
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_roles.sql
│   ├── 003_create_projects.sql
│   ├── 004_create_milestones.sql
│   ├── 005_create_tasks.sql
│   ├── 006_create_user_roles.sql
│   ├── 007_create_project_members.sql
│   ├── 008_create_comments.sql
│   ├── 009_create_attachments.sql
│   ├── 010_create_time_logs.sql
│   ├── 011_create_task_watchers.sql
│   ├── 012_create_notifications.sql
│   ├── 013_create_activity_logs.sql
│   └── 014_create_settings.sql
├── seeds/
│   ├── 001_roles.sql
│   ├── 002_users.sql
│   ├── 003_projects.sql
│   ├── 004_milestones.sql
│   └── 005_tasks.sql
├── views/
│   ├── project_summary.sql
│   ├── task_summary.sql
│   └── user_activity.sql
├── functions/
│   ├── update_updated_at.sql
│   └── calculate_progress.sql
├── triggers/
│   ├── update_timestamps.sql
│   └── audit_log.sql
├── schema.sql                # Complete database schema
└── README.md                 # Database documentation
```

## Documentation Structure (`docs/`)
```
docs/
├── api/
│   ├── authentication.md      # Auth API documentation
│   ├── projects.md           # Project API documentation
│   ├── tasks.md              # Task API documentation
│   ├── milestones.md         # Milestone API documentation
│   ├── users.md              # User API documentation
│   ├── comments.md           # Comment API documentation
│   ├── attachments.md        # Attachment API documentation
│   ├── timeLogs.md           # Time log API documentation
│   └── notifications.md      # Notification API documentation
├── deployment/
│   ├── backend.md            # Backend deployment guide
│   ├── frontend.md           # Frontend deployment guide
│   ├── database.md           # Database setup guide
│   └── docker.md             # Docker deployment
├── development/
│   ├── setup.md              # Development setup
│   ├── coding-standards.md   # Code standards
│   ├── testing.md            # Testing guidelines
│   └── contributing.md       # Contribution guidelines
├── user/
│   ├── getting-started.md    # User getting started
│   ├── projects.md           # Project management guide
│   ├── tasks.md              # Task management guide
│   ├── time-tracking.md      # Time tracking guide
│   └── notifications.md      # Notification settings
└── architecture/
    ├── system-overview.md    # System architecture
    ├── database-design.md    # Database design
    ├── api-design.md         # API design
    └── security.md           # Security considerations
```

## Scripts Structure (`scripts/`)
```
scripts/
├── build/
│   ├── build-backend.sh      # Backend build script
│   ├── build-frontend.sh     # Frontend build script
│   └── build-all.sh          # Complete build script
├── deploy/
│   ├── deploy-backend.sh     # Backend deployment
│   ├── deploy-frontend.sh    # Frontend deployment
│   └── deploy-database.sh    # Database deployment
├── test/
│   ├── test-backend.sh       # Backend testing
│   ├── test-frontend.sh      # Frontend testing
│   └── test-all.sh           # Complete testing
├── database/
│   ├── migrate.sh            # Database migration
│   ├── seed.sh               # Database seeding
│   └── backup.sh             # Database backup
└── utils/
    ├── lint.sh               # Code linting
    ├── format.sh             # Code formatting
    └── clean.sh              # Clean build artifacts
```

## Key Features of This Structure

### **Separation of Concerns**
- **Backend**: Pure Node.js/Express API
- **Frontend**: React application with Redux
- **Database**: PostgreSQL with migrations
- **Documentation**: Comprehensive guides

### **Scalability**
- Modular component structure
- Service layer architecture
- Database views for complex queries
- Separate test suites

### **Maintainability**
- Clear folder organization
- Consistent naming conventions
- Comprehensive documentation
- Automated scripts

### **Development Workflow**
- Hot reloading for development
- Automated testing
- Code linting and formatting
- Database migrations

This structure provides a solid foundation for a scalable, maintainable project management system with clear separation between frontend and backend code. 