# Architecture Overview

_Last updated: 2024-02-16 14:57 UTC_
_Reason: Updated API structure, security measures, and monitoring details to reflect current implementation_

## Frontend Architecture

### Current Implementation
- **Framework**: Next.js 15 with App Router
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
  - Token-based authentication
  - Pagination support

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
├── lib/
│   ├── api/           # API client functions
│   ├── utils/         # Utility functions
│   └── constants.ts   # Constants and configs
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
  - JWT authentication
  - Rate limiting
  - Pagination support

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
  - Authentication data
  - Profile information
  - Account settings
- **projects**: Project information
  - Basic details
  - Ownership
  - Archive status
- **issues**: Task/issue tracking
  - Status and priority
  - Assignments
  - Project association
- **comments**: Issue comments
  - Content
  - Timestamps
  - Author information

### Relationships
- One-to-many between projects and issues
- One-to-many between users and projects (creator)
- One-to-many between users and issues (creator/assignee)
- One-to-many between issues and comments

## API Structure

### Current Endpoints
- `/api/v1/auth/*`: Authentication endpoints
  - POST /sign-up
  - POST /sign-in
  - POST /sign-out
  - GET /check-email
- `/api/v1/projects/*`: Project management
  - GET / (with pagination)
  - GET /:id
  - POST /
  - PATCH /:id
  - DELETE /:id
- `/api/v1/issues/*`: Issue management
  - GET / (with pagination)
  - GET /:id
  - POST /
  - PATCH /:id
  - DELETE /:id
- `/api/v1/users/*`: User management
  - GET /me
  - PATCH /me
  - POST /me/password

### Authentication
- JWT-based authentication
- Token storage in localStorage/sessionStorage
- Authorization header for protected routes
- "Remember me" functionality
- Rate limiting on auth endpoints

## Development Environment

### Tools
- Docker for containerization
- Air for Go hot reloading
- ESLint + Prettier for code formatting
- Husky for Git hooks
- Make for common operations

### Local Setup
- Docker Compose for services
  - PostgreSQL
  - Redis (prepared)
- Environment variables
- Hot reloading for both frontend and backend

## Deployment

### Current Status
- Development environment complete
- Production setup pending
- CI/CD pipeline planned

### Infrastructure Requirements
- PostgreSQL database
- Redis cache (prepared)
- Node.js runtime
- Go runtime
- Reverse proxy (planned)
- SSL termination (planned)

## Security Considerations

### Implemented
- HTTPS enforcement
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection
- JWT token security
- Password hashing (bcrypt)
- Rate limiting on auth endpoints
- Authorization header validation

### Planned
- API key authentication
- Audit logging
- Security headers
- CSRF protection
- Session management
- Two-factor authentication

## Monitoring and Logging

### Current Status
- Structured logging with levels
- Request/response logging
- Error tracking
- Database query logging
- Authentication attempt logging

### Future Plans
- APM integration
- Log aggregation
- Metrics collection
- Alert system
- Performance monitoring
- User activity tracking

## Testing Strategy

### Current Status
- Unit test structure prepared
- Integration tests planned
- E2E testing framework selected
- API endpoint tests in progress

### Coverage Goals
- Backend: 80% coverage target
- Frontend: Component testing focus
- API: Full integration test suite
- E2E: Critical user flows

## Documentation

### Available
- API documentation (OpenAPI planned)
- Setup guides
- Architecture overview
- Entity relationships
- Authentication flow
- URL structure

### In Progress
- User guides
- API reference
- Deployment guides
- Troubleshooting guides
- Security documentation
