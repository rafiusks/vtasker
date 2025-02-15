# Architecture Documentation

## System Overview

vTasker is a modern task management system built with a microservices architecture. The system consists of the following main components:

1. **Frontend Service**
   - Next.js application
   - React components with Tailwind CSS
   - TanStack Query for data fetching
   - Zustand for state management

2. **Backend Service**
   - Go HTTP server
   - Chi router for routing
   - Repository pattern for data access
   - JWT authentication

3. **Database**
   - PostgreSQL for persistent storage
   - UUID for primary keys
   - Optimized indexes
   - Automatic timestamps

4. **Cache**
   - Redis for session storage
   - Query caching
   - Rate limiting

## Database Schema

The database uses a relational schema with the following core entities:

1. **Users**
   - Authentication and profile information
   - Email-based registration
   - Secure password hashing
   - Avatar support

2. **Projects**
   - Project management
   - Created by users
   - Soft deletion support
   - Automatic timestamps

3. **Issues**
   - Task tracking
   - Status workflow
   - Priority levels
   - Assignee management

4. **Comments**
   - Discussion threads
   - Issue-based grouping
   - User attribution
   - Timestamp tracking

For detailed schema information, see [Database Documentation](database.md).

## Authentication Flow

1. **Email Check**
   ```
   Client -> POST /auth/check-email -> Server
   Server -> Check Database -> Response
   ```

2. **Registration**
   ```
   Client -> POST /auth/sign-up -> Server
   Server -> Hash Password -> Create User -> Generate Token -> Response
   ```

3. **Login**
   ```
   Client -> POST /auth/sign-in -> Server
   Server -> Verify Credentials -> Generate Token -> Response
   ```

4. **Protected Routes**
   ```
   Client -> Request with JWT -> Server
   Server -> Validate Token -> Process Request -> Response
   ```

## Security Measures

1. **Password Security**
   - Bcrypt hashing
   - Minimum length requirements
   - Complexity validation

2. **Authentication**
   - JWT tokens
   - Token expiration
   - Refresh token rotation

3. **Rate Limiting**
   - Per-endpoint limits
   - IP-based tracking
   - Redis-backed storage

4. **Data Protection**
   - HTTPS only
   - CORS configuration
   - Input validation
   - SQL injection prevention

## Error Handling

1. **Client Errors**
   - Input validation
   - Authentication errors
   - Resource not found
   - Rate limiting

2. **Server Errors**
   - Graceful degradation
   - Error logging
   - Retry mechanisms
   - Circuit breaking

## Performance Optimization

1. **Database**
   - Optimized indexes
   - Connection pooling
   - Query optimization
   - Soft deletes

2. **Caching**
   - Redis caching
   - Query result caching
   - Session storage
   - Rate limit tracking

3. **API**
   - Response compression
   - Pagination
   - Partial responses
   - Batch operations

## Development Workflow

1. **Local Development**
   - Docker Compose
   - Hot reloading
   - Environment variables
   - Migration tools

2. **Testing**
   - Unit tests
   - Integration tests
   - End-to-end tests
   - Test data seeding

3. **Deployment**
   - Container orchestration
   - Database migrations
   - Environment configuration
   - Health monitoring

For setup instructions, see [Setup Guide](setup.md).
For API documentation, see [API Documentation](api.md).
