# Development Setup Guide

_Last updated: 2024-02-16 05:46 UTC_
_Reason: Updated development environment setup instructions, added detailed manual setup steps, and included common troubleshooting guides_

## Prerequisites

- Node.js 18.x or later
- Go 1.21 or later
- Docker and Docker Compose
- Make (for running commands)
- Git

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vtasker.git
cd vtasker
```

2. Start the development environment:
```bash
make dev
```

This will:
- Start PostgreSQL and Redis containers
- Apply database migrations
- Start the backend server with hot reloading
- Start the frontend development server

## Manual Setup

### 1. Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=vtasker
DB_SSL_MODE=disable

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-256-bit-secret
JWT_EXPIRY=24h

# Server
PORT=8080
ENV=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

1. Start PostgreSQL and Redis:
```bash
make docker-up
```

2. Apply migrations:
```bash
make migrate-up
```

### 3. Backend Setup

1. Install Go dependencies:
```bash
cd backend
go mod download
```

2. Start the development server:
```bash
make dev
```

The server will start on http://localhost:8080 with hot reloading enabled via Air.

### 4. Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000.

## Project Structure

```
vtasker/
├── backend/
│   ├── cmd/
│   │   └── server/        # Application entry point
│   ├── internal/
│   │   ├── handler/       # HTTP handlers
│   │   ├── middleware/    # HTTP middleware
│   │   ├── model/        # Database models
│   │   └── service/      # Business logic
│   ├── migrations/       # Database migrations
│   └── pkg/             # Shared packages
├── frontend/
│   ├── app/             # Next.js pages
│   ├── components/      # React components
│   ├── store/          # State management
│   └── hooks/          # Custom hooks
└── docs/               # Documentation
```

## Available Commands

### Root Level (Makefile)
```bash
make dev              # Start development environment
make docker-up        # Start Docker containers
make docker-down      # Stop Docker containers
make migrate-up       # Apply database migrations
make migrate-down     # Rollback migrations
make test            # Run all tests
make lint            # Run linters
```

### Backend
```bash
cd backend
go run cmd/server/main.go  # Start server
go test ./...             # Run tests
go mod tidy               # Clean up dependencies
```

### Frontend
```bash
cd frontend
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run test            # Run tests
```

## Development Workflow

1. **Code Style**
   - Backend follows Go standard formatting (gofmt)
   - Frontend uses ESLint and Prettier
   - Pre-commit hooks enforce formatting

2. **Git Workflow**
   - Feature branches from `main`
   - Pull requests for all changes
   - Squash merges preferred

3. **Testing**
   - Write tests for new features
   - Run `make test` before committing
   - Ensure all linters pass

## Common Issues

### Database Connection
If you can't connect to the database:
1. Check if Docker containers are running
2. Verify database credentials in `.env`
3. Ensure migrations are applied

### Hot Reload Not Working
For backend:
1. Check if Air is installed
2. Verify `.air.toml` configuration
3. Restart the development server

For frontend:
1. Clear `.next` directory
2. Restart the development server
3. Check for file watching limits

### Authentication Issues
1. Verify JWT secret in `.env`
2. Check token expiration settings
3. Clear browser storage and cookies

## Next Steps

1. Set up your development environment
2. Create necessary `.env` files
3. Start the development servers
4. Visit http://localhost:3000

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Go Documentation](https://golang.org/doc/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/) 