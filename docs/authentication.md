# Authentication

## Overview

The vTasker application uses a secure JWT-based authentication system with bcrypt password hashing and various security features to protect user accounts.

## Security Features

- Password hashing using bcrypt (cost factor: 12)
- JWT token-based authentication
- Account locking after 5 failed login attempts
- "Remember Me" functionality with extended token expiration
- Last login tracking
- Failed login attempt monitoring

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