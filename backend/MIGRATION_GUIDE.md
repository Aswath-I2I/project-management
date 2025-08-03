# Database Migration Guide

This guide explains how to use the database migration system for the Project Management Backend.

## 📋 Migration Commands

### Available Scripts

```bash
# Run migrations (create tables, indexes, seed data)
npm run migrate

# Rollback migrations (delete everything)
npm run migrate:down

# Reset database (rollback + migrate)
npm run migrate:reset

# Test migration locally
node test-migration.js

# Deploy with migrations
npm run deploy

# Railway-specific deployment
npm run railway:deploy
```

## 🚀 Migration Up (deploy-setup.js)

### What It Does:
- Creates all database tables
- Sets up indexes for performance
- Creates triggers for automatic `updated_at` updates
- Seeds initial data (superadmin user, roles)

### Tables Created:
- `users` - User accounts and profiles
- `roles` - System roles and permissions
- `projects` - Project information
- `tasks` - Task management
- `project_members` - Team member assignments
- `time_logs` - Time tracking entries

### Seed Data:
- **Superadmin User**:
  - Username: `superadmin`
  - Password: `admin@123`
  - Email: `superadmin@projectmanagement.com`
- **Default Roles**:
  - `admin` - Full system access
  - `project_manager` - Project management capabilities
  - `member` - Basic project access

## ⬇️ Migration Down (migrate-down.js)

### What It Does:
- **WARNING**: Deletes ALL data and schema changes
- Removes all tables, indexes, and triggers
- Resets database to initial state

### Safety Features:
- **Interactive Confirmation**: Requires user confirmation
- **Production Protection**: Double confirmation in production
- **Clear Warnings**: Detailed explanation of what will be deleted

### Usage:
```bash
npm run migrate:down
```

You will be prompted:
```
⚠️  WARNING: This will delete ALL data and schema changes!
📋 This operation will:
   - Delete all tables (users, projects, tasks, time_logs, etc.)
   - Remove all indexes and triggers
   - Delete all data permanently
   - Reset database to initial state

Are you sure you want to continue? (yes/no): yes
```

In production, additional confirmation is required:
```
⚠️  PRODUCTION ENVIRONMENT DETECTED!
Type "DELETE ALL DATA" to confirm: DELETE ALL DATA
```

## 🔄 Migration Reset

### What It Does:
- Runs migration down (deletes everything)
- Runs migration up (recreates everything)
- Useful for testing and development

### Usage:
```bash
npm run migrate:reset
```

## 🧪 Testing Migrations

### Local Testing:
```bash
node test-migration.js
```

This will:
- Test the migration script locally
- Verify database connectivity
- Show success/error messages
- Provide troubleshooting tips

### Expected Output:
```
🧪 Testing migration script locally...
Make sure your local database is running and accessible.
Environment variables should be set for local database connection.

🚀 Starting Railway deployment setup...
📄 Executing database migrations...
✅ Database migrations completed successfully!
🎉 Railway deployment setup completed!
📋 Superadmin credentials:
   Username: superadmin
   Password: admin@123

✅ Migration test completed successfully!
🎯 Ready for Railway deployment.
```

## 🔧 Environment Variables

### Required for Migrations:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=project_management
DB_USER=postgres
DB_PASSWORD=root

# Application Configuration
NODE_ENV=development
RUN_MIGRATIONS=true
```

### Railway Environment:
```env
# Railway provides these automatically
DB_HOST=your-railway-postgres-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=postgres
DB_PASSWORD=your-railway-postgres-password

# Application Configuration
NODE_ENV=production
RUN_MIGRATIONS=true
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

## 🚨 Important Warnings

### Migration Down:
- **PERMANENT**: All data will be lost
- **IRREVERSIBLE**: Cannot be undone
- **PRODUCTION**: Extra confirmation required
- **BACKUP**: Always backup before running

### Production Usage:
- Never run `migrate:down` in production without backup
- Use Railway's rollback feature instead
- Test migrations in development first
- Monitor logs during deployment

## 🔍 Troubleshooting

### Common Issues:

#### Connection Errors:
```bash
# Check if PostgreSQL is running
pg_ctl status

# Verify connection settings
psql -h localhost -U postgres -d project_management
```

#### Permission Errors:
```bash
# Check user permissions
psql -h localhost -U postgres -c "\du"

# Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE project_management TO postgres;
```

#### Migration Failures:
1. Check database logs
2. Verify environment variables
3. Ensure database exists
4. Check user permissions
5. Review migration SQL for syntax errors

### Error Messages:

#### "Table already exists":
- This is normal for `CREATE TABLE IF NOT EXISTS`
- Migration will continue safely

#### "Function already exists":
- This is normal for `CREATE OR REPLACE FUNCTION`
- Function will be updated

#### "Trigger already exists":
- Migration will drop and recreate triggers
- This is safe and expected

## 📊 Migration Status

### Check Migration Status:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'projects', 'tasks', 'time_logs');

-- Check if superadmin user exists
SELECT username, email FROM users WHERE username = 'superadmin';

-- Check if roles exist
SELECT name FROM roles;
```

### Expected Tables:
- `users`
- `roles`
- `projects`
- `tasks`
- `project_members`
- `time_logs`

## 🔄 Continuous Integration

### Railway Deployment:
- Migrations run automatically on deploy
- Controlled by `RUN_MIGRATIONS=true`
- Logs show migration progress
- Health check confirms success

### Local Development:
- Run migrations manually when needed
- Use `migrate:reset` for clean slate
- Test changes before committing

## 📝 Best Practices

### Development:
1. Always test migrations locally first
2. Use `migrate:reset` for clean development
3. Keep migration files in version control
4. Document schema changes

### Production:
1. Never run `migrate:down` in production
2. Use Railway's built-in rollback
3. Monitor migration logs
4. Backup before major changes

### Testing:
1. Test migrations in isolated environment
2. Verify data integrity after migration
3. Check application functionality
4. Validate seed data

## 🎯 Success Indicators

### Migration Up Success:
```
🚀 Starting Railway deployment setup...
📄 Executing database migrations...
✅ Database migrations completed successfully!
🎉 Railway deployment setup completed!
📋 Superadmin credentials:
   Username: superadmin
   Password: admin@123
```

### Migration Down Success:
```
🚀 Starting migration down...
📄 Executing migration down...
✅ Migration down completed successfully!
🗑️  All tables, indexes, triggers, and data have been removed.
🔄 Database has been reset to initial state.
```

## 🔗 Related Files

- `railway-setup.sql` - Migration up SQL
- `migrate-down.sql` - Migration down SQL
- `deploy-setup.js` - Migration up runner
- `migrate-down.js` - Migration down runner
- `test-migration.js` - Migration tester
- `RAILWAY_DEPLOYMENT.md` - Railway deployment guide 