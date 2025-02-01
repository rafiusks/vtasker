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
- `status`: Filter by status ('backlog', 'in-progress', 'review', 'done')
- `priority`: Filter by priority ('low', 'normal', 'high')
- `type`: Filter by type ('feature', 'bug', 'docs', 'chore')
- `labels`: Filter by labels (comma-separated)
- `createdAfter`: Filter by creation date (ISO string)
- `createdBefore`: Filter by creation date (ISO string)
- `updatedAfter`: Filter by update date (ISO string)
- `updatedBefore`: Filter by update date (ISO string)

Response:
```typescript
{
  tasks: Array<{
    id: string; // UUID v4 format
    title: string;
    description: string;
    status: 'backlog' | 'in-progress' | 'review' | 'done';
    priority: 'low' | 'normal' | 'high';
    type: 'feature' | 'bug' | 'docs' | 'chore';
    labels: string[];
    dependencies: string[]; // Array of task UUIDs
    parent?: string; // Optional parent task UUID
    board?: string; // Optional board ID
    column?: string; // Optional column ID
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    status_history: Array<{
      from: 'backlog' | 'in-progress' | 'review' | 'done';
      to: 'backlog' | 'in-progress' | 'review' | 'done';
      timestamp: string; // ISO datetime
      comment?: string;
    }>;
    content: {
      description: string;
      acceptance_criteria: string[];
      implementation_details?: string;
      notes?: string;
      attachments?: string[];
    };
  }>
}
```

### Status Management

The API enforces status transition rules to ensure tasks follow a proper workflow:

1. Valid Status Order:
   - backlog -> in-progress -> review -> done

2. Transition Rules:
   - Tasks can only move one step forward at a time
   - Tasks can move backwards to any previous status
   - Cannot move to the same status
   - Cannot skip statuses (e.g., backlog -> review is invalid)

3. Status History:
   - All status changes are tracked with timestamps
   - Previous status is preserved in history
   - Optional comments can be added to status changes

Example status transition error:
```json
{
  "error": "Invalid status transition",
  "message": "Tasks must go through in-progress before moving to review"
}
```

### Update Task Status

```http
PUT /tasks/:id
```

Request body for status update:
```typescript
{
  status: 'backlog' | 'in-progress' | 'review' | 'done';
}
```

Response: Updated task object with new status and updated status history

Error Responses:
- 400: Invalid status transition
- 404: Task not found
- 500: Server error

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
  title: string; // Required, max 200 chars
  description: string; // Required
  status: 'backlog' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'normal' | 'high';
  type: 'feature' | 'bug' | 'docs' | 'chore';
  labels?: string[];
  dependencies?: string[]; // Array of task UUIDs
  parent?: string; // Optional parent task UUID
  board?: string; // Optional board ID
  column?: string; // Optional column ID
  content: {
    description: string;
    acceptance_criteria: string[];
    implementation_details?: string;
    notes?: string;
    attachments?: string[];
  };
}
```

Response: Created task object with generated UUID and timestamps

### Update Task

```http
PUT /tasks/:id
```

Request body: Partial task object (only include fields to update)
- All fields are optional except when updating descriptions
- When updating description, both root level and content.description must be provided
- Timestamps (created_at, updated_at) cannot be modified
- Task ID cannot be modified

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
  details?: Array<{
    path: string;
    message: string;
  }>;
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 204: No Content (successful deletion)
- 400: Bad Request (validation error, includes details array)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Data Validation

All requests are validated using Zod schemas. Common validation rules:

- Task IDs: Must be valid UUIDs (v4)
- Title: 1-200 characters
- Status: Must be one of: 'backlog', 'in-progress', 'review', 'done'
- Priority: Must be one of: 'low', 'normal', 'high'
- Type: Must be one of: 'feature', 'bug', 'docs', 'chore'
- Dates: Must be valid ISO 8601 datetime strings
- Arrays (labels, dependencies): Must contain valid strings/UUIDs
- Content: Must include required fields (description, acceptance_criteria)

## Legacy Support

For backward compatibility, the API temporarily supports the old task ID format (`task-XXX-X`) in addition to UUIDs. This support will be removed in a future version.

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