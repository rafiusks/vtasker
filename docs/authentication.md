# Authentication

_Last updated: 2024-02-16 05:44 UTC_
_Reason: Updated authentication flow documentation, added implementation details for JWT handling, and included frontend integration examples_

## Overview

vTasker uses JWT (JSON Web Tokens) for authentication. The system implements a secure, stateless authentication flow with token refresh capabilities.

## Authentication Flow

### 1. Registration
```typescript
POST /api/auth/sign-up
{
  email: string;
  password: string;
  name: string;
}
```

- Validates email format and uniqueness
- Enforces password strength requirements
- Creates user account
- Returns JWT token and user data

### 2. Login
```typescript
POST /api/auth/sign-in
{
  email: string;
  password: string;
}
```

- Validates credentials
- Returns JWT token and user data
- Includes refresh token for extended sessions

### 3. Token Refresh
```typescript
POST /api/auth/refresh
{
  refreshToken: string;
}
```

- Validates refresh token
- Issues new access token
- Updates refresh token rotation

### 4. Logout
```typescript
POST /api/auth/sign-out
```

- Invalidates current session
- Clears refresh token
- Returns success status

## Implementation Details

### JWT Structure
```typescript
{
  "sub": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1516239022,
  "exp": 1516242622
}
```

### Security Measures
1. **Password Storage**
   - Bcrypt hashing
   - Salt rounds: 12
   - Minimum length: 8 characters

2. **Token Security**
   - Short-lived access tokens (1 hour)
   - HTTP-only cookies for refresh tokens
   - Secure flag in production
   - CSRF protection

3. **Rate Limiting**
   - Login attempts: 5 per minute
   - Token refresh: 10 per minute
   - Account creation: 3 per hour

### Error Handling

1. **Registration Errors**
   - Email already exists
   - Password too weak
   - Invalid email format

2. **Login Errors**
   - Invalid credentials
   - Account locked
   - Too many attempts

3. **Token Errors**
   - Token expired
   - Invalid token
   - Refresh token reuse

## Frontend Integration

### State Management
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Protected Routes
```typescript
// Route guard implementation
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) {
    return redirect("/auth/login");
  }
  return children;
};
```

### Token Management
- Automatic token refresh
- Background refresh before expiration
- Logout on token failure

## Current Status

### Implemented
- ✅ Basic authentication flow
- ✅ JWT token handling
- ✅ Protected routes
- ✅ User registration
- ✅ Login/logout functionality
- ✅ Password hashing
- ✅ Error handling

### In Progress
- 🔄 Remember me functionality
- 🔄 Password reset flow
- 🔄 Email verification

### Planned
- ⏳ Two-factor authentication
- ⏳ OAuth integration
- ⏳ Session management
- ⏳ Account lockout
- ⏳ Security audit logging

## API Endpoints

### Check Email Availability
```http
POST /auth/check-email
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Response:
```json
{
  "data": {
    "exists": true
  }
}
```

### Sign Up
```http
POST /auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Sign In
```http
POST /auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

Response:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Password Requirements

- Minimum length: 8 characters
- Maximum length: 72 characters (bcrypt limitation)

## JWT Token

### Claims
- `user_id`: User's UUID
- `email`: User's email address
- Standard JWT claims (`iat`, `exp`, `nbf`)

### Expiration
- Regular tokens: 24 hours
- "Remember Me" tokens: 30 days

### Usage
Include the JWT token in the `Authorization` header for protected routes:
```http
Authorization: Bearer <token>
```

## Security Measures

### Account Locking
- Accounts are automatically locked after 5 failed login attempts
- Locked accounts require administrator intervention to unlock
- Failed login attempts are reset upon successful login

### Password Storage
- Passwords are never stored in plain text
- Bcrypt hashing with a cost factor of 12 is used
- Each password has a unique salt

### Token Security
- Tokens are signed using a secure secret key
- Production deployments should use a strong, unique secret
- Tokens include expiration times to limit their validity

## Development Configuration

The JWT secret key can be configured using the `JWT_SECRET` environment variable. For development, a default secret is used if none is provided:

```env
JWT_SECRET=your-256-bit-secret-key-change-this-in-production
```

**Note:** Always use a strong, unique secret key in production environments. 