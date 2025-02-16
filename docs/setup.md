# Development Setup Guide

## Prerequisites

- Docker and Docker Compose
- Git

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd vtasker
```

2. Configure environment variables:
```bash
# Copy example environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the environment files with your settings
# Particularly important for security:
# - JWT_SECRET: Use a strong, unique secret in production
# - DB_PASSWORD: Use a strong database password
```

3. Start the development environment:
```bash
make dev
```

This will start all services in Docker containers:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API (with hot-reloading) on port 8080
- Frontend (with hot-reloading) on port 3000

## Security Configuration

### JWT Secret Key

The JWT secret key is used to sign authentication tokens. In development, a default key is used, but in production, you must set a strong, unique secret:

```env
# backend/.env
JWT_SECRET=your-256-bit-secret-key-change-this-in-production
```

Generate a secure key using:
```bash
openssl rand -base64 32
```

### Database Security

1. Set strong passwords in production:
```env
# .env
DB_PASSWORD=your-strong-password

# docker-compose.yml will use these credentials
```

2. Configure SSL for database connections in production:
```env
# backend/.env
DB_SSL_MODE=require
```

### Rate Limiting

Rate limiting is configured in the backend to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Protected endpoints: 60 requests per minute

Adjust these limits in production according to your needs.

## Project Structure

```
vtasker/
├── backend/              # Go backend service
│   ├── cmd/             # Application entrypoints
│   ├── internal/        # Private application code
│   │   ├── auth/       # Authentication utilities
│   │   ├── handler/    # HTTP handlers
│   │   ├── middleware/ # HTTP middleware
│   │   ├── models/     # Data models
│   │   └── repository/ # Data access layer
│   ├── pkg/            # Public library code
│   ├── .air.toml       # Hot reload configuration
│   └── Dockerfile.dev  # Development container config
├── frontend/           # Next.js frontend
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── lib/           # Shared utilities
│   ├── store/         # State management
│   └── Dockerfile.dev # Development container config
├── docs/              # Documentation
└── docker-compose.yml # Development services
```

## Development Workflow

The entire development environment runs in Docker containers with hot-reloading enabled:

1. **Starting the Environment:**
   ```bash
   make dev
   ```
   This command starts all services and shows combined logs in the terminal.

2. **Backend Development:**
   - Edit Go files in the `backend/` directory
   - Changes are automatically detected by `air`
   - Backend rebuilds and restarts automatically
   - API is available at `http://localhost:8080`

3. **Frontend Development:**
   - Edit files in the `frontend/` directory
   - Next.js hot module replacement is enabled
   - Changes appear immediately
   - Frontend is available at `http://localhost:3000`

4. **Database Access:**
   - Host: localhost
   - Port: 5432
   - User: vtasker
   - Password: vtasker_dev (development only)
   - Database: vtasker

5. **Redis Access:**
   - Host: localhost
   - Port: 6379

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files
   - Use strong, unique passwords in production
   - Rotate secrets regularly

2. **Database:**
   - Use SSL in production
   - Regularly update passwords
   - Keep PostgreSQL updated

3. **Authentication:**
   - Use HTTPS in production
   - Set secure cookie options
   - Implement proper CORS settings

4. **API Security:**
   - Rate limiting enabled
   - JWT token validation
   - Password hashing with bcrypt

## Available Services

All services run in Docker containers and are connected through the `vtasker-network`:

### Database (PostgreSQL)
- Container name: vtasker-postgres
- Data persisted in `vtasker-postgres-data` volume
- SSL support for production

### Cache (Redis)
- Container name: vtasker-redis
- Data persisted in `vtasker-redis-data` volume
- Used for rate limiting and caching

### Backend API
- Container name: vtasker-backend
- Hot-reloading enabled via `air`
- Source code mounted from ./backend
- JWT authentication
- Rate limiting

### Frontend
- Container name: vtasker-frontend
- Hot-reloading enabled via Next.js
- Source code mounted from ./frontend
- Secure cookie handling

## Troubleshooting

1. **Container Issues:**
   - View container status: `docker-compose ps`
   - Check container logs: `docker-compose logs [service]`
   - Restart services: `docker-compose restart [service]`
   - Full rebuild: `docker-compose up --build`

2. **Authentication Issues:**
   - Check JWT_SECRET is properly set
   - Verify token expiration
   - Check for rate limiting
   - Validate CORS settings

3. **Database Issues:**
   - Check connection settings
   - Verify SSL configuration
   - Check user permissions

4. **Network Issues:**
   - Ensure all containers are on the same network
   - Check container DNS resolution
   - Verify port mappings

5. **Database Migrations:**
   ```bash
   make migrate-up   # Apply migrations
   make migrate-down # Rollback migrations
   ```

For detailed database documentation, see [Database Documentation](database.md).
For authentication details, see [Authentication Documentation](authentication.md). 