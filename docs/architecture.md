# Architecture Overview

_Last updated: 2024-02-16 05:37 UTC_
_Reason: Updated frontend and backend architecture details to reflect current implementation, added sections for monitoring and testing strategy_

## Frontend Architecture

### Current Implementation
- **Framework**: Next.js 14 with App Router
- **State Management**: 
  - Zustand for global state
  - TanStack Query for server state
- **UI Components**: 
  - Shadcn/ui component library
  - Tailwind CSS for styling
- **Key Features**:
  - Server and client components
  - Optimistic updates
  - Responsive layouts
  - Dark mode support

### Directory Structure
```
frontend/
├── app/
│   ├── (auth)/         # Authentication routes
│   ├── (dashboard)/    # Protected dashboard routes
│   ├── api/            # API route handlers
│   └── providers.tsx   # Global providers
├── components/
│   ├── ui/            # Reusable UI components
│   ├── layout/        # Layout components
│   └── projects/      # Project-specific components
├── store/
│   ├── index.ts       # Store exports
│   ├── slices/        # Store slices
│   └── types.ts       # TypeScript types
└── hooks/             # Custom hooks
```

## Backend Architecture

### Current Implementation
- **Language**: Go
- **Router**: Chi
- **Database**: PostgreSQL
- **Cache**: Redis (prepared)
- **Key Features**:
  - Structured logging
  - Middleware chain
  - Error handling
  - Hot reloading

### Directory Structure
```
backend/
├── cmd/
│   └── server/        # Application entry point
├── internal/
│   ├── handler/       # HTTP handlers
│   ├── middleware/    # HTTP middleware
│   ├── model/         # Database models
│   └── service/       # Business logic
├── migrations/        # Database migrations
└── pkg/              # Shared packages
```

## Database Schema

### Core Tables
- **users**: User management
- **projects**: Project information
- **issues**: Task/issue tracking
- **comments**: Issue comments

### Relationships
- One-to-many between projects and issues
- One-to-many between users and projects (creator)
- One-to-many between users and issues (creator/assignee)

## API Structure

### Current Endpoints
- `/api/auth/*`: Authentication endpoints
- `/api/projects/*`: Project management
- `/api/issues/*`: Issue management
- `/api/users/*`: User management

### Authentication
- JWT-based authentication
- Token refresh mechanism
- Role-based access control (prepared)

## Development Environment

### Tools
- Docker for containerization
- Air for Go hot reloading
- ESLint + Prettier for code formatting
- Husky for Git hooks

### Local Setup
- Docker Compose for services
- Make commands for common operations
- Environment variable management

## Deployment

### Current Status
- Development environment complete
- Production setup pending
- CI/CD pipeline planned

### Infrastructure Requirements
- PostgreSQL database
- Redis cache
- Node.js runtime
- Go runtime
- Reverse proxy (planned)

## Security Considerations

### Implemented
- HTTPS enforcement
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

### Planned
- Rate limiting
- API key authentication
- Audit logging
- Security headers
- CSRF protection

## Monitoring and Logging

### Current Status
- Basic structured logging
- Error tracking
- Performance monitoring (planned)

### Future Plans
- APM integration
- Log aggregation
- Metrics collection
- Alert system

## Testing Strategy

### Current Status
- Unit test structure prepared
- Integration tests planned
- E2E testing framework selected

### Coverage Goals
- Backend: 80% coverage target
- Frontend: Component testing focus
- API: Full integration test suite

## Documentation

### Available
- API documentation
- Setup guides
- Architecture overview
- Entity relationships

### In Progress
- User guides
- API reference
- Deployment guides
- Troubleshooting guides
