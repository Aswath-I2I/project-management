# Railway Deployment Guide

This guide explains how to deploy the Project Management Backend to Railway with automatic database migrations.

## 🚀 Quick Deployment

### 1. Prerequisites
- Railway account
- PostgreSQL database (Railway provides this)
- Git repository connected to Railway

### 2. Environment Variables
Set these environment variables in Railway:

```env
# Database Configuration (Railway will provide these)
DB_HOST=your-railway-postgres-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=postgres
DB_PASSWORD=your-railway-postgres-password

# Application Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=https://your-frontend-domain.com

# Migration Control
RUN_MIGRATIONS=true
```

### 3. Deployment Process

The deployment process automatically:

1. **Runs Database Migrations**: Creates all tables, indexes, and triggers
2. **Seeds Initial Data**: Creates superadmin user and default roles
3. **Starts the Server**: Begins serving the API

## 📋 Automatic Migration Features

### What Gets Created:

#### Tables:
- `users` - User accounts and profiles
- `roles` - System roles and permissions
- `projects` - Project information
- `tasks` - Task management
- `project_members` - Team member assignments
- `time_logs` - Time tracking entries

#### Indexes:
- Performance indexes on all major columns
- Composite indexes for common queries

#### Triggers:
- Automatic `updated_at` timestamp updates
- Data integrity constraints

#### Seed Data:
- **Superadmin User**:
  - Username: `superadmin`
  - Password: `admin@123`
  - Email: `superadmin@projectmanagement.com`
- **Default Roles**:
  - `admin` - Full system access
  - `project_manager` - Project management capabilities
  - `member` - Basic project access

## 🔧 Manual Migration Commands

If you need to run migrations manually:

```bash
# Run migrations only
npm run migrate

# Run migrations and start server
npm run deploy

# Railway-specific deployment
npm run railway:deploy
```

## 📊 Health Check

The application provides a health check endpoint:
- **URL**: `/health`
- **Method**: GET
- **Response**: Server status and uptime

## 🔍 Troubleshooting

### Migration Issues:
1. Check database connection in Railway logs
2. Verify environment variables are set correctly
3. Ensure PostgreSQL service is running

### Common Errors:
- **Connection Timeout**: Increase `connectionTimeoutMillis` in database config
- **Permission Denied**: Check database user permissions
- **Table Already Exists**: Migrations use `CREATE TABLE IF NOT EXISTS`

### Logs:
- Railway provides real-time logs in the dashboard
- Check for migration success messages
- Look for any error messages during startup

## 🔐 Security Notes

### Production Considerations:
1. **Change Default Password**: Update superadmin password after first login
2. **JWT Secret**: Use a strong, unique JWT secret
3. **CORS**: Configure `FRONTEND_URL` to match your frontend domain
4. **Rate Limiting**: Already configured for production use

### Database Security:
- Railway provides SSL connections automatically
- Database credentials are managed by Railway
- No hardcoded credentials in the codebase

## 📈 Monitoring

### Railway Dashboard:
- Monitor application health
- View real-time logs
- Check resource usage
- Database connection status

### Application Metrics:
- Request/response times
- Error rates
- Database query performance
- Memory usage

## 🔄 Continuous Deployment

### Automatic Deployments:
- Railway automatically deploys on Git push
- Migrations run on every deployment
- Zero-downtime deployments

### Rollback:
- Railway provides easy rollback functionality
- Previous versions are preserved
- Database migrations are idempotent

## 📞 Support

If you encounter issues:

1. Check Railway logs first
2. Verify environment variables
3. Test database connectivity
4. Review migration logs for specific errors

## 🎯 Success Indicators

Your deployment is successful when you see:

```
🚀 Starting Railway deployment setup...
📄 Executing database migrations...
✅ Database migrations completed successfully!
🎉 Railway deployment setup completed!
📋 Superadmin credentials:
   Username: superadmin
   Password: admin@123
Server running on port 3000
Environment: production
```

## 🔗 API Endpoints

Once deployed, your API will be available at:
- **Base URL**: `https://your-railway-app.railway.app`
- **Health Check**: `https://your-railway-app.railway.app/health`
- **API Docs**: `https://your-railway-app.railway.app/api-docs` (if configured) 