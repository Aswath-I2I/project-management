# Database Setup Guide

This directory contains all database-related files for the Project Management System.

## 📁 File Structure

```
database/
├── database-schema.sql    # Complete PostgreSQL schema
├── seed-data.sql         # Sample data for testing
├── init-database.js      # Database initialization script
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** (v16 or higher)
3. **npm** or **yarn**

### Installation Steps

1. **Install dependencies** (from project root):
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=project_management
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

3. **Initialize the database**:
   ```bash
   cd database
   node init-database.js
   ```

## 📊 Database Schema

### Core Tables

| Table | Description | Key Features |
|-------|-------------|--------------|
| `users` | User accounts and profiles | Authentication, roles, preferences |
| `roles` | System roles and permissions | Role-based access control |
| `projects` | Project information | Status, priority, budget tracking |
| `milestones` | Project milestones | Due dates, completion tracking |
| `tasks` | Individual work items | Assignment, progress, time tracking |
| `comments` | User comments | Nested replies, attachments |
| `attachments` | File uploads | Multiple entity support |
| `time_logs` | Time tracking | Billable hours, project tracking |

### Relationship Tables

| Table | Purpose | Relationships |
|-------|---------|---------------|
| `user_roles` | User-role assignments | Many-to-many |
| `project_members` | Project team members | Many-to-many |
| `task_watchers` | Task notifications | Many-to-many |

## 🌱 Seed Data

The `seed-data.sql` file includes comprehensive sample data:

### Users (6 accounts)
- **admin** - System administrator
- **john.doe** - Project manager
- **jane.smith** - Developer
- **mike.wilson** - Developer
- **sarah.johnson** - Developer
- **david.brown** - Viewer

**Default password for all users**: `password123`

### Projects (4 projects)
1. **E-commerce Website Redesign** - Active, high priority
2. **Mobile App Development** - Active, medium priority
3. **Database Migration** - On hold, low priority
4. **Security Audit** - Completed, urgent priority

### Sample Data Includes
- ✅ 8 milestones across projects
- ✅ 11 tasks with various statuses
- ✅ 6 comments with nested replies
- ✅ 4 file attachments
- ✅ 9 time log entries
- ✅ 5 notifications
- ✅ 5 activity log entries
- ✅ User settings and project configurations

## 🔧 Database Features

### Security
- **UUID primary keys** for all tables
- **Bcrypt password hashing**
- **JWT token authentication**
- **Role-based access control**

### Performance
- **Comprehensive indexing** on frequently queried columns
- **Connection pooling** for efficient resource usage
- **Query optimization** with proper foreign keys

### Data Integrity
- **Foreign key constraints** with appropriate CASCADE/RESTRICT rules
- **Check constraints** for data validation
- **Unique constraints** for business rules
- **Triggers** for automatic timestamp updates

## 📈 Views and Reports

### Pre-built Views
- `project_summary` - Project statistics and metrics
- `task_summary` - Task details with progress
- `user_activity` - User performance metrics

### Sample Queries

```sql
-- Get all active projects with team size
SELECT p.name, p.status, COUNT(pm.user_id) as team_size
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.status;

-- Get tasks assigned to a specific user
SELECT t.title, t.status, p.name as project_name
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.assigned_to = 'user-uuid-here';

-- Get time logs for a project
SELECT u.first_name, u.last_name, tl.hours_spent, tl.date
FROM time_logs tl
JOIN users u ON tl.user_id = u.id
WHERE tl.project_id = 'project-uuid-here'
ORDER BY tl.date DESC;
```

## 🛠️ Maintenance

### Backup
```bash
pg_dump -h localhost -U postgres project_management > backup.sql
```

### Restore
```bash
psql -h localhost -U postgres project_management < backup.sql
```

### Reset Database
```bash
# Drop and recreate
dropdb -h localhost -U postgres project_management
createdb -h localhost -U postgres project_management
node init-database.js
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection refused**
   - Ensure PostgreSQL is running
   - Check port 5432 is available
   - Verify credentials in `.env`

2. **Permission denied**
   - Check PostgreSQL user permissions
   - Ensure database exists
   - Verify user has CREATE privileges

3. **Duplicate key errors**
   - Normal when re-running seed data
   - Data already exists, safe to ignore

### Logs
- Check `backend/logs/` for application logs
- PostgreSQL logs: `/var/log/postgresql/` (Linux) or PostgreSQL data directory

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Documentation](https://node-postgres.com/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)

## 🤝 Contributing

When adding new tables or modifying schema:

1. Update `database-schema.sql`
2. Add corresponding seed data to `seed-data.sql`
3. Test with `node init-database.js`
4. Update this README with new features 