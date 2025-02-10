# API Documentation

## Base URL
All API endpoints are prefixed with `/api`

## Authentication

### Register
Create a new user account.

```http
POST /auth/register
Content-Type: application/json

{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response** `201 Created`
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "created_at": "timestamp"
}
```

### Login
Authenticate a user and receive access tokens.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string",
  "rememberMe": "boolean"
}
```

**Response** `200 OK`
```json
{
  "token": "string",
  "refresh_token": "string",
  "expires_in": "number",
  "refresh_expires_in": "number",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "created_at": "timestamp"
  }
}
```

### Refresh Token
Refresh an expired access token.

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

**Response** `200 OK`
```json
{
  "token": "string",
  "expires_in": "number"
}
```

## Tasks

### List Tasks
Retrieve a list of tasks with optional filtering.

```http
GET /tasks
Authorization: Bearer <token>
```

Query Parameters:
- `status`: Filter by status code
- `priority`: Filter by priority code
- `type`: Filter by type code

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status_id": "number",
    "priority_id": "number",
    "type_id": "number",
    "owner_id": "uuid",
    "parent_id": "uuid",
    "order_index": "number",
    "content": {
      "description": "string",
      "acceptance_criteria": [
        {
          "id": "uuid",
          "description": "string",
          "completed": "boolean",
          "completed_at": "timestamp",
          "completed_by": "uuid",
          "order": "number",
          "category": "string",
          "notes": "string"
        }
      ],
      "implementation_details": "string",
      "notes": "string",
      "attachments": ["string"],
      "due_date": "timestamp",
      "assignee": "uuid"
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### Get Task
Retrieve a single task by ID.

```http
GET /tasks/{id}
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status_id": "number",
  "priority_id": "number",
  "type_id": "number",
  "owner_id": "uuid",
  "parent_id": "uuid",
  "order_index": "number",
  "content": {
    "description": "string",
    "acceptance_criteria": [
      {
        "id": "uuid",
        "description": "string",
        "completed": "boolean",
        "completed_at": "timestamp",
        "completed_by": "uuid",
        "order": "number",
        "category": "string",
        "notes": "string"
      }
    ],
    "implementation_details": "string",
    "notes": "string",
    "attachments": ["string"],
    "due_date": "timestamp",
    "assignee": "uuid"
  },
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Create Task
Create a new task.

```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "status_id": "number",
  "priority_id": "number",
  "type_id": "number",
  "content": {
    "description": "string",
    "acceptance_criteria": [
      {
        "description": "string",
        "category": "string",
        "notes": "string",
        "order": "number"
      }
    ],
    "implementation_details": "string",
    "notes": "string",
    "attachments": ["string"],
    "due_date": "timestamp",
    "assignee": "uuid"
  }
}
```

**Response** `201 Created`
```json
{
  "id": "uuid",
  "title": "string",
  // ... same as Get Task response
}
```

### Update Task
Update an existing task.

```http
PUT /tasks/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "status_id": "number",
  "priority_id": "number",
  "type_id": "number",
  "content": {
    "description": "string",
    "acceptance_criteria": [
      {
        "id": "uuid",
        "description": "string",
        "category": "string",
        "notes": "string",
        "order": "number"
      }
    ],
    "implementation_details": "string",
    "notes": "string",
    "attachments": ["string"],
    "due_date": "timestamp",
    "assignee": "uuid"
  }
}
```

**Response** `200 OK`
```json
{
  "id": "uuid",
  "title": "string",
  // ... same as Get Task response
}
```

### Delete Task
Delete a task.

```http
DELETE /tasks/{id}
Authorization: Bearer <token>
```

**Response** `204 No Content`

## Reference Data

### List Task Statuses
Get all available task statuses.

```http
GET /task-statuses
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
[
  {
    "id": "number",
    "code": "string",
    "name": "string",
    "description": "string",
    "color": "string",
    "icon": "string",
    "display_order": "number",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### List Task Priorities
Get all available task priorities.

```http
GET /task-priorities
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
[
  {
    "id": "number",
    "code": "string",
    "name": "string",
    "description": "string",
    "color": "string",
    "icon": "string",
    "display_order": "number",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### List Task Types
Get all available task types.

```http
GET /task-types
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
[
  {
    "id": "number",
    "code": "string",
    "name": "string",
    "description": "string",
    "color": "string",
    "icon": "string",
    "display_order": "number",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "string"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization header required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting
The API implements rate limiting to prevent abuse. Current limits are:
- 100 requests per 100ms
- 10 requests per quantum

When rate limit is exceeded:
```json
{
  "error": "Too many requests - try again later"
}
``` 