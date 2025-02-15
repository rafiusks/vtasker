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

2. Start the development environment:
```bash
make dev
```

This will start all services in Docker containers:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API (with hot-reloading) on port 8080
- Frontend (with hot-reloading) on port 3000

The development environment is fully containerized, with hot-reloading enabled for both frontend and backend development.

## Project Structure

```
vtasker/
├── backend/              # Go backend service
│   ├── cmd/             # Application entrypoints
│   ├── internal/        # Private application code
│   ├── pkg/             # Public library code
│   ├── .air.toml        # Hot reload configuration
│   └── Dockerfile.dev   # Development container config
├── frontend/            # Next.js frontend
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── lib/            # Shared utilities
│   ├── store/          # State management
│   └── Dockerfile.dev  # Development container config
├── docs/               # Documentation
└── docker-compose.yml  # Development services
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
   - Password: vtasker_dev
   - Database: vtasker

5. **Redis Access:**
   - Host: localhost
   - Port: 6379

## Available Services

All services run in Docker containers and are connected through the `vtasker-network`:

### Database (PostgreSQL)
- Container name: vtasker-postgres
- Data persisted in `vtasker-postgres-data` volume

### Cache (Redis)
- Container name: vtasker-redis
- Data persisted in `vtasker-redis-data` volume

### Backend API
- Container name: vtasker-backend
- Hot-reloading enabled via `air`
- Source code mounted from ./backend

### Frontend
- Container name: vtasker-frontend
- Hot-reloading enabled via Next.js
- Source code mounted from ./frontend

## Troubleshooting

1. **Container Issues:**
   - View container status: `docker-compose ps`
   - Check container logs: `docker-compose logs [service]`
   - Restart services: `docker-compose restart [service]`
   - Full rebuild: `docker-compose up --build`

2. **Hot-Reloading Issues:**
   - Backend: Check `air` logs in the container output
   - Frontend: Check Next.js logs in the container output
   - Rebuild specific service: `docker-compose up -d --build [service]`

3. **Network Issues:**
   - Ensure all containers are on the same network: `docker network inspect vtasker-network`
   - Check container DNS resolution: `docker exec -it vtasker-backend ping vtasker-postgres`

4. **Database Migrations:**
   ```bash
   make migrate-up   # Apply migrations
   make migrate-down # Rollback migrations
   ```

For detailed database documentation, see [Database Documentation](database.md). 