# Development Setup Guide

## Prerequisites

- Node.js (v18 or later)
- Go (v1.21 or later)
- Docker and Docker Compose
- Git

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd vtasker
```

2. Start the development database and cache:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Set up environment variables:

Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=vtasker
DB_PASSWORD=vtasker_dev
DB_NAME=vtasker

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

5. Start the development servers:

Backend:
```bash
cd backend
air
```

Frontend:
```bash
cd frontend
npm run dev
```

## Project Structure

```
vtasker/
├── backend/              # Go backend service
│   ├── cmd/             # Application entrypoints
│   ├── internal/        # Private application code
│   ├── pkg/             # Public library code
│   └── .air.toml        # Hot reload configuration
├── frontend/            # Next.js frontend
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── lib/            # Shared utilities
│   └── store/          # State management
├── docs/               # Documentation
└── docker-compose.yml  # Development services
```

## Available Services

### Database (PostgreSQL)

- **Host:** localhost
- **Port:** 5432
- **User:** vtasker
- **Password:** vtasker_dev
- **Database:** vtasker

The database data is persisted in a Docker volume named `vtasker-postgres-data`.

### Cache (Redis)

- **Host:** localhost
- **Port:** 6379

Redis is configured with append-only persistence, and data is stored in a Docker volume named `vtasker-redis-data`.

## Frontend Configuration

The frontend uses several key technologies:

1. **State Management:**
   - Zustand for global state
   - TanStack Query for server state

2. **API Integration:**
   - Custom API client with error handling
   - Type-safe query hooks
   - Automatic request retries and caching

3. **Components:**
   - Shared UI component library
   - Layout components (Header/Footer)
   - Tailwind CSS for styling

## Development Workflow

1. **Backend Changes:**
   - The backend uses Air for hot reloading
   - Changes to Go files trigger automatic rebuilds
   - API endpoints are available at `http://localhost:8080`

   Testing the Projects API:
   ```bash
   # Create a project
   curl -X POST http://localhost:8080/api/v1/projects \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Project", "description": "A test project"}'

   # List projects
   curl http://localhost:8080/api/v1/projects?page=1&page_size=10

   # Get a project
   curl http://localhost:8080/api/v1/projects/{project_id}

   # Update a project
   curl -X PUT http://localhost:8080/api/v1/projects/{project_id} \
     -H "Content-Type: application/json" \
     -d '{"name": "Updated Project"}'

   # Delete a project
   curl -X DELETE http://localhost:8080/api/v1/projects/{project_id}
   ```

2. **Frontend Changes:**
   - Next.js provides hot module replacement
   - Changes are reflected immediately
   - Application runs at `http://localhost:3000`

3. **Database Changes:**
   - Connect using your preferred PostgreSQL client
   - Default connection string: `postgresql://vtasker:vtasker_dev@localhost:5432/vtasker`

## Troubleshooting

1. **Database Connection Issues:**
   - Ensure Docker containers are running: `docker-compose ps`
   - Check logs: `docker-compose logs postgres`
   - Verify connection settings in `.env`

2. **Redis Connection Issues:**
   - Check Redis container: `docker-compose ps redis`
   - View logs: `docker-compose logs redis`
   - Ensure ports are not in use

3. **Development Server Issues:**
   - Clear Node modules: `rm -rf node_modules && npm install`
   - Check for port conflicts
   - Verify environment variables 