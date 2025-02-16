# vTasker API Documentation

## Overview

The vTasker API is a RESTful API that provides access to the vTasker task management system. The API is versioned and currently at v1.

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:
```http
Authorization: Bearer <token>
```

### Authentication Endpoints

#### Check Email Availability
```http
POST /auth/check-email
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Response (200 OK):
```json
{
  "data": {
    "exists": true
  }
}
```

#### Sign Up
```http
POST /auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response (201 Created):
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

Error Responses:
- 400 Bad Request: Password too short
- 409 Conflict: Email already exists
- 500 Internal Server Error: Server error

#### Sign In
```http
POST /auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

Response (200 OK):
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

Error Responses:
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Invalid credentials
- 403 Forbidden: Account locked
- 500 Internal Server Error: Server error

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

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request body"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Account is locked. Please contact support."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse. The current limits are:

- Authentication endpoints: 5 requests per minute
- Protected endpoints: 60 requests per minute

When rate limited, the API will respond with:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": "Too many requests. Please try again later."
}
```

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (1-based)
- `page_size`: Number of items per page

Response includes:
- `total`: Total number of items
- `page`: Current page number
- `page_size`: Number of items per page
