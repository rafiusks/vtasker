# API Documentation

_Last updated: 2024-02-16 05:44 UTC_
_Reason: Updated API endpoints documentation to reflect current implementation, added detailed request/response examples, and included rate limiting information_

## Overview

This document describes the REST API endpoints available in vTasker. All endpoints are prefixed with `/api/v1`.

## Authentication

### Endpoints

```http
POST /api/auth/sign-up
POST /api/auth/sign-in
POST /api/auth/sign-out
GET /api/auth/me
```

### Authentication Flow
All authenticated requests must include a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Projects API

### List Projects
```http
GET /api/projects

Query Parameters:
- page (number): Page number for pagination
- limit (number): Items per page
- search (string): Search term for filtering
- sort (string): Sort field (name, createdAt, updatedAt)
- order (string): Sort order (asc, desc)
- archived (boolean): Include archived projects

Response: {
  data: Project[],
  total: number,
  page: number,
  limit: number
}
```

### Get Project
```http
GET /api/projects/{id}

Response: Project
```

### Create Project
```http
POST /api/projects

Body: {
  name: string,
  description: string,
  template?: "blank" | "scrum" | "kanban"
}

Response: Project
```

### Update Project
```http
PATCH /api/projects/{id}

Body: {
  name?: string,
  description?: string,
  is_archived?: boolean
}

Response: Project
```

### Delete Project
```http
DELETE /api/projects/{id}

Response: { success: true }
```

## Issues API

### List Issues
```http
GET /api/issues

Query Parameters:
- project_id (string): Filter by project
- status (string): Filter by status
- priority (string): Filter by priority
- assignee_id (string): Filter by assignee
- page (number): Page number
- limit (number): Items per page

Response: {
  data: Issue[],
  total: number,
  page: number,
  limit: number
}
```

### Get Issue
```http
GET /api/issues/{id}

Response: Issue
```

### Create Issue
```http
POST /api/issues

Body: {
  title: string,
  description: string,
  project_id: string,
  status: "todo" | "in_progress" | "in_review" | "done",
  priority: "low" | "medium" | "high",
  assignee_id?: string
}

Response: Issue
```

### Update Issue
```http
PATCH /api/issues/{id}

Body: {
  title?: string,
  description?: string,
  status?: string,
  priority?: string,
  assignee_id?: string
}

Response: Issue
```

### Delete Issue
```http
DELETE /api/issues/{id}

Response: { success: true }
```

## Users API

### Get Profile
```http
GET /api/users/me

Response: User
```

### Update Profile
```http
PATCH /api/users/me

Body: {
  name?: string,
  email?: string,
  avatar?: string
}

Response: User
```

### Update Password
```http
POST /api/users/me/password

Body: {
  current_password: string,
  new_password: string
}

Response: { success: true }
```

## Data Types

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  is_archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Issue
```typescript
interface Issue {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "in_review" | "done";
  priority: "low" | "medium" | "high";
  projectId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}
```

## Error Handling

All errors follow this format:
```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}
```

### Common Error Codes
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1623456789
```
