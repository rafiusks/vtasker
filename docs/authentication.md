# Authentication

_Last updated: 2024-02-16 14:56 UTC_
_Reason: Updated authentication documentation to reflect current implementation, added token storage details, and updated API endpoints_

## Overview

vTasker uses JWT (JSON Web Tokens) for authentication. The system implements a secure, stateless authentication flow with token storage in either localStorage or sessionStorage based on "Remember me" preference.

## Authentication Flow

### 1. Check Email
```typescript
POST /api/v1/auth/check-email
{
  email: string;
}

Response:
{
  "data": {
    "exists": boolean
  }
}
```

### 2. Registration
```typescript
POST /api/v1/auth/sign-up
{
  email: string;
  password: string;
  name: string;
}

Response:
{
  "token": string;
  "user": {
    "id": string;
    "email": string;
    "name": string;
    "avatar_url": string | null;
    "is_verified": boolean;
    "created_at": string;
    "updated_at": string;
  }
}
```

### 3. Login
```typescript
POST /api/v1/auth/sign-in
{
  email: string;
  password: string;
  rememberMe?: boolean;
}

Response:
{
  "token": string;
  "user": {
    "id": string;
    "email": string;
    "name": string;
    "avatar_url": string | null;
    "is_verified": boolean;
    "created_at": string;
    "updated_at": string;
  }
}
```

### 4. Logout
```typescript
POST /api/v1/auth/sign-out

Response:
{
  "success": true
}
```

## Implementation Details

### Token Storage
- `localStorage` for "Remember me" option
- `sessionStorage` for regular sessions
- Key: `auth_token`

### JWT Structure
```typescript
{
  "user_id": string;
  "email": string;
  "exp": number;
  "nbf": number;
  "iat": number;
}
```

### Security Measures
1. **Password Storage**
   - Bcrypt hashing
   - Minimum length: 8 characters

2. **Token Security**
   - JWT expiration: 24 hours
   - Authorization header for all protected routes
   - CORS protection

3. **Rate Limiting**
   - Login attempts: 5 per minute
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
   - Missing token

## Frontend Integration

### State Management (Zustand)
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
```

### Protected Routes
```typescript
// Middleware implementation
export default function withAuth(
  handler: NextApiHandler,
): NextApiHandler {
  return async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // ... token validation
  };
}
```

### API Client
```typescript
const getDefaultHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = localStorage.getItem("auth_token") || 
                 sessionStorage.getItem("auth_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};
```

## Current Status

### Implemented ✅
- Email availability check
- User registration
- Login with "Remember me"
- Logout
- Protected routes
- Token storage
- Error handling
- Authorization header forwarding

### In Progress 🔄
- Password reset
- Email verification
- Account settings
- Session management

### Planned ⏳
- Two-factor authentication
- OAuth providers
- Account lockout
- Security audit logging
- Token refresh
- Remember me persistence

## API Response Examples

### Check Email
```http
POST /api/v1/auth/check-email
{
  "email": "user@example.com"
}

Response:
{
  "data": {
    "exists": true
  }
}
```

### Sign Up
```http
POST /api/v1/auth/sign-up
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1878c1b7-3461-48ba-8a98-d998c77f6d43",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": null,
    "is_verified": false,
    "created_at": "2024-02-16T14:33:24.456952Z",
    "updated_at": "2024-02-16T14:33:24.456952Z"
  }
}
```

### Sign In
```http
POST /api/v1/auth/sign-in
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1878c1b7-3461-48ba-8a98-d998c77f6d43",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": null,
    "is_verified": false,
    "created_at": "2024-02-16T14:33:24.456952Z",
    "updated_at": "2024-02-16T14:33:24.456952Z"
  }
}
```

## Error Response Examples

### Invalid Credentials
```json
{
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

### Account Locked
```json
{
  "error": "Your account has been locked. Please try again later.",
  "code": "ACCOUNT_LOCKED"
}
```

### Rate Limited
```json
{
  "error": "Too many attempts. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
} 