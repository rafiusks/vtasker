# vTasker API Documentation

## Overview

The vTasker API is a RESTful API that provides access to the vTasker task management system. The API is versioned and currently at v1.

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

Authentication will be implemented using JWT tokens. Currently, authentication is not enforced for development purposes.

## Projects Module

### Create Project

Create a new project.

```http
POST /projects
```

#### Request Body

```json
{
  "name": "string",         // required, max length: 255
  "description": "string"   // optional, max length: 1000
}
```

#### Response

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "created_by": "uuid",
  "is_archived": false,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "issue_count": 0,
  "open_issue_count": 0
}
```

Status: 201 Created

### List Projects

Retrieve a paginated list of projects.

```http
GET /projects?page=1&page_size=10
```

#### Query Parameters

- `page` (optional): Page number (default: 1)
- `page_size` (optional): Number of items per page (default: 10)

#### Response

```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "created_by": "uuid",
      "is_archived": false,
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "issue_count": 0,
      "open_issue_count": 0
    }
  ],
  "total": 0,
  "page": 1,
  "page_size": 10
}
```

Status: 200 OK

### Get Project

Retrieve a single project by ID.

```http
GET /projects/{id}
```

#### Response

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "created_by": "uuid",
  "is_archived": false,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "issue_count": 0,
  "open_issue_count": 0
}
```

Status: 200 OK

### Update Project

Update an existing project.

```http
PUT /projects/{id}
```

#### Request Body

```json
{
  "name": "string",         // optional, max length: 255
  "description": "string",  // optional, max length: 1000
  "is_archived": false      // optional
}
```

#### Response

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "created_by": "uuid",
  "is_archived": false,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "issue_count": 0,
  "open_issue_count": 0
}
```

Status: 200 OK

### Delete Project

Soft delete a project by setting `is_archived` to true.

```http
DELETE /projects/{id}
```

Status: 204 No Content

## Error Responses

The API uses standard HTTP status codes and returns error messages in a consistent format:

```json
{
  "error": "string",
  "message": "string",
  "details": {}  // optional
}
```

Common error codes:
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Missing or invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server error

## Rate Limiting

Rate limiting will be implemented in future versions of the API.

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (1-based)
- `page_size`: Number of items per page

Response includes:
- `total`: Total number of items
- `page`: Current page number
- `page_size`: Number of items per page
