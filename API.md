# vTasker API Reference

This document describes the API endpoints and data structures for the vTasker application.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Most endpoints require authentication. Send a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Tasks

### List Tasks

```http
GET /tasks
```

Query parameters:
- `status`: Filter by status ('backlog', 'in_progress', 'review', 'done')
- `priority`: Filter by priority ('low', 'medium', 'high')
- `labels`: Filter by labels (comma-separated)

Response:
```typescript
{
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: 'backlog' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high';
    labels: string[];
    dependencies: string[];
    created_at: string;
    updated_at: string;
    content: {
      notes: string;
      attachments: string[];
    };
  }>
}
```

### Get Task

```http
GET /tasks/:id
```

Response: Single task object

### Create Task

```http
POST /tasks
```

Request body:
```typescript
{
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  labels?: string[];
  dependencies?: string[];
  content?: {
    notes?: string;
    attachments?: string[];
  };
}
```

Headers:
- `X-Task-ID`: Optional custom task ID (if not provided, one will be generated)

Response:
```typescript
{
  id: string;
}
```

### Update Task

```http
PUT /tasks/:id
```

Request body: Partial task object (only include fields to update)

Response: Updated task object

### Delete Task

```http
DELETE /tasks/:id
```

Response: 204 No Content

## Boards

### List Boards

```http
GET /boards
```

Response:
```typescript
{
  boards: Array<{
    id: string;
    name: string;
    description?: string;
    columns: Array<{
      id: string;
      name: string;
      tasks: string[];
    }>;
    created_at: string;
    updated_at: string;
  }>
}
```

### Get Board

```http
GET /boards/:id
```

Response: Single board object

### Create Board

```http
POST /boards
```

Request body:
```typescript
{
  name: string;
  description?: string;
  columns: Array<{
    id: string;
    name: string;
  }>;
}
```

Response: Created board object

### Update Board

```http
PUT /boards/:id
```

Request body: Partial board object (only include fields to update)

Response: Updated board object

### Delete Board

```http
DELETE /boards/:id
```

Response: 204 No Content

## File Storage

Tasks and boards are stored in the `.vtask` directory:
- Tasks: `.vtask/tasks/<task-id>.md` (Markdown format)
- Boards: `.vtask/boards/<board-id>.yaml` (YAML format)

### Task Markdown Format

```markdown
# Task Title

## Description
Task description here...

**Status**: backlog
**Priority**: high
**Labels**: feature, security
**Dependencies**: task-1, task-2

## Notes
- Note 1
- Note 2

## Attachments
- file1.png
- file2.pdf
```

### Board YAML Format

```yaml
name: Main Board
description: Main project board
columns:
  - id: backlog
    name: Backlog
    tasks:
      - task-1
      - task-2
  - id: in_progress
    name: In Progress
    tasks:
      - task-3
created_at: "2024-02-20T12:00:00Z"
updated_at: "2024-02-20T12:00:00Z"
```

## Error Handling

Errors are returned in the following format:

```typescript
{
  error: string;
  message: string;
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 204: No Content (successful deletion)
- 400: Bad Request (invalid input)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Examples

### Create a Task

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Implement login page",
    "description": "Create a login page with email and password fields",
    "status": "backlog",
    "priority": "high",
    "labels": ["frontend", "auth"],
    "content": {
      "notes": "Use Chakra UI components"
    }
  }'
```

### Update Task Status

```bash
curl -X PUT http://localhost:8000/api/tasks/task-1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "in_progress"
  }'
```

### List Tasks in Progress

```bash
curl http://localhost:8000/api/tasks?status=in_progress \
  -H "Authorization: Bearer <token>"
``` 