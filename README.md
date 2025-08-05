# Project Management Dashboard

A comprehensive project management system built with React frontend and Node.js backend, featuring real-time task management, team collaboration, time tracking, and project analytics.

## 🌐 Live Demo

**🚀 Deployed Application**: [https://project-management-ui.up.railway.app/](https://project-management-ui.up.railway.app/)

**📋 Demo Credentials**:
- **Email**: `superadmin@projectmanagement.com`
- **Password**: `admin@123`

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with Vite
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: React Router DOM
- **UI Library**: Tailwind CSS + Framer Motion
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: React Icons

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with pg-pool
- **Authentication**: JWT with bcrypt
- **Validation**: Express Validator
- **File Upload**: Multer
- **CORS**: Enabled for cross-origin requests

## 🚀 Features

### 📊 Dashboard
- **Real-time Statistics**: Project count, active tasks, completed tasks, total hours
- **Recent Projects**: Quick access to latest projects with progress indicators
- **My Tasks**: Personalized task list with clickable task cards
- **Interactive Task Management**: Click any task to open detailed modal
- **Responsive Design**: Optimized for desktop and mobile devices

### 📋 Task Management
- **Task Creation & Editing**: Full CRUD operations with pre-populated forms
- **Task Status Management**: Todo, In Progress, Review, Completed, Closed
- **Priority Levels**: Low, Medium, High, Urgent with color coding
- **Task Assignment**: Assign tasks to team members
- **Progress Tracking**: Visual progress bars with percentage updates
- **Due Date Management**: Set and track task deadlines
- **Task Types**: Task, Bug, Feature, Story categorization
- **Time Estimation**: Set estimated hours for tasks

### 👥 Team Management
- **User Management**: Add, edit, and manage team members
- **Role-based Access Control**: Admin, Project Manager, Developer, Viewer roles
- **Project Membership**: Assign users to specific projects
- **User Profiles**: View user details and assigned tasks
- **Team Filtering**: Search and filter team members

### 📈 Project Management
- **Project Creation**: Create new projects with detailed information
- **Project Dashboard**: Overview with milestones, team, tasks, and activities
- **Project Progress**: Visual progress tracking
- **Milestone Management**: Create and track project milestones
- **Project Analytics**: Task completion rates and team performance

### ⏱️ Time Tracking
- **Manual Time Logging**: Log hours directly without start/end times
- **Project & Task Selection**: Mandatory selection for accurate tracking
- **Time Reports**: View logged hours per project and task
- **Time Analytics**: Track estimated vs actual hours

### 💬 Comments System
- **Task Comments**: Add comments to tasks for collaboration
- **Real-time Updates**: Comments appear immediately
- **User Attribution**: Comments show author information
- **Rich Text Support**: Basic formatting support

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Frontend and backend validation
- **Input Sanitization**: Prevent XSS and injection attacks
- **Role-based Permissions**: Granular access control

## 📁 Project Structure

```
project-management-dashboard/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── config/          # Configuration files
│   │   └── utils/           # Utility functions
│   ├── database/            # Database schema and seeds
│   └── uploads/             # File uploads directory
└── docs/                    # Documentation
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- npm or pnpm

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-management-dashboard/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env-template.txt .env
   ```
   
   Update `.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=project_management
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. **Database Setup**
   ```bash
   # Run the complete database setup
   node deploy-setup.js
   ```

5. **Start the server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Railway Deployment
The application is configured for Railway deployment:

- **Frontend**: https://project-management-ui.up.railway.app/
- **Backend**: https://project-management-backend.up.railway.app/

### Environment Variables for Production
```bash
# Backend
DB_HOST=your_railway_db_host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your_railway_db_password
JWT_SECRET=your_production_jwt_secret
PORT=5000

# Frontend
VITE_API_URL=https://project-management-backend.up.railway.app/api
```

## 📊 Database Schema

### Core Tables
- **users**: User accounts and profiles
- **projects**: Project information and metadata
- **tasks**: Task details and assignments
- **project_members**: User-project relationships
- **time_logs**: Time tracking records
- **comments**: Task and project comments
- **milestones**: Project milestones
- **roles**: User roles and permissions
- **user_roles**: User-role assignments

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `PATCH /api/tasks/:id/assign` - Assign task

### Team Management
- `GET /api/team/users` - Get all users
- `POST /api/team/users` - Create user
- `GET /api/team/users/:id` - Get user details
- `PUT /api/team/users/:id` - Update user
- `DELETE /api/team/users/:id` - Delete user

### Time Tracking
- `GET /api/time/logs` - Get time logs
- `POST /api/time/log` - Create time log
- `PUT /api/time/logs/:id` - Update time log
- `DELETE /api/time/logs/:id` - Delete time log

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Breakpoint optimization for tablets and desktops
- Touch-friendly interface elements

### Interactive Components
- **Modals**: Task details, edit forms, confirmation dialogs
- **Dropdowns**: Status, priority, and assignment selectors
- **Progress Bars**: Visual task and project progress
- **Cards**: Project and task display cards
- **Forms**: Validated input forms with error handling

### Visual Feedback
- Loading states and spinners
- Success and error notifications
- Hover effects and transitions
- Color-coded status indicators

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Secure password hashing with bcrypt
- Token refresh mechanism
- Session management

### Authorization
- Role-based access control (RBAC)
- Project-level permissions
- Task assignment restrictions
- API endpoint protection

### Data Validation
- Input sanitization and validation
- SQL injection prevention
- XSS protection
- File upload security

## 📈 Performance Optimizations

### Frontend
- Code splitting and lazy loading
- Optimized bundle size with Vite
- Memoized components
- Efficient state management

### Backend
- Database connection pooling
- Query optimization
- Caching strategies
- Rate limiting

## 📝 Recent Updates

### Latest Features Added
1. **Task Detail Modal**: Clickable task cards that open detailed modals
2. **Edit Task Functionality**: Pre-populated edit forms with task data
3. **Comments System**: Add comments to tasks for collaboration
4. **Time Tracking**: Manual hour logging with project/task selection
5. **Team Management**: User filtering and role management
6. **Input Validation**: Frontend and backend validation with error handling
7. **Responsive Design**: Mobile-optimized interface
8. **Project Analytics**: Progress tracking and performance metrics

### Bug Fixes
- Fixed task assignment issues
- Resolved database migration problems
- Corrected API endpoint errors
- Fixed frontend validation issues
- Resolved deployment configuration problems
