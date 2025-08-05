# Docker Deployment Guide

This guide covers deploying the Project Management Dashboard using Docker and Docker Compose.

## 🐳 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available
- 10GB free disk space

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project-management-dashboard
```

### 2. Environment Setup
Create environment files for customization:

```bash
# Backend environment
cp backend/env-template.txt backend/.env

# Frontend environment
echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env
```

### 3. Start the Application
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

## 🔧 Configuration Options

### Environment Variables

#### Backend (.env)
```bash
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_NAME=project_management
DB_USER=postgres
DB_PASSWORD=postgres123
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
NODE_ENV=production
```

### Database Configuration
The PostgreSQL database is automatically initialized with:
- Database name: `project_management`
- Username: `postgres`
- Password: `postgres123`
- Port: `5432`

## 📊 Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (Nginx)       │◄──►│   (Node.js)     │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Management Commands

### Basic Operations
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f [service-name]

# Access container shell
docker-compose exec [service-name] sh
```

### Database Operations
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d project_management

# Backup database
docker-compose exec postgres pg_dump -U postgres project_management > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres project_management < backup.sql
```

### Maintenance
```bash
# Update images
docker-compose pull
docker-compose up -d

# Clean up unused resources
docker system prune -f

# Remove all containers and volumes
docker-compose down -v
```

## 🔒 Production Deployment

### 1. Security Configuration
Update the following in `docker-compose.yml`:
```yaml
environment:
  JWT_SECRET: your-very-secure-jwt-secret-key
  DB_PASSWORD: your-secure-database-password
```

### 2. SSL/HTTPS Setup
For production with SSL:

1. **Generate SSL certificates**:
```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

2. **Start with nginx reverse proxy**:
```bash
docker-compose --profile production up -d
```

### 3. Environment-Specific Configuration
Create environment-specific compose files:

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📈 Monitoring and Logging

### Health Checks
All services include health checks:
```bash
# Check service health
docker-compose ps

# View health check logs
docker-compose exec backend curl http://localhost:5000/api/health
```

### Log Management
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f
```

### Performance Monitoring
```bash
# Resource usage
docker stats

# Container inspection
docker-compose exec backend top
docker-compose exec postgres psql -U postgres -c "SELECT version();"
```

## 🔄 Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres project_management > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres project_management > $BACKUP_DIR/backup_$DATE.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v project-management-dashboard_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Restore volumes
docker run --rm -v project-management-dashboard_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_data_YYYYMMDD_HHMMSS.tar.gz -C /data
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000
netstat -tulpn | grep :5432

# Change ports in docker-compose.yml if needed
```

#### 2. Database Connection Issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

#### 3. Memory Issues
```bash
# Check memory usage
docker stats

# Increase memory limits in docker-compose.yml
```

#### 4. Build Issues
```bash
# Clean build
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend
```

### Debug Commands
```bash
# Inspect containers
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres

# Check network connectivity
docker-compose exec backend ping postgres
docker-compose exec frontend ping backend
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Update environment variables
- [ ] Generate SSL certificates (production)
- [ ] Set secure passwords
- [ ] Configure backup strategy
- [ ] Set up monitoring

### Deployment
- [ ] Run health checks
- [ ] Verify database connectivity
- [ ] Test API endpoints
- [ ] Check frontend functionality
- [ ] Validate SSL (production)

### Post-Deployment
- [ ] Monitor logs for errors
- [ ] Test backup/restore procedures
- [ ] Verify performance metrics
- [ ] Update documentation

## 🔧 Customization

### Adding Custom Services
```yaml
# Add to docker-compose.yml
redis:
  image: redis:alpine
  container_name: project-management-redis
  networks:
    - project-network
```

### Custom Build Contexts
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile.prod
    args:
      NODE_ENV: production
```

### Volume Mounts
```yaml
backend:
  volumes:
    - ./backend/uploads:/app/uploads
    - ./backend/logs:/app/logs
    - ./backend/config:/app/config
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review service logs
3. Verify environment configuration
4. Test with minimal configuration
5. Create an issue with detailed error information 