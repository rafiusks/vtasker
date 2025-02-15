# vTasker API Documentation

## Overview

The vTasker API is a RESTful API that provides access to the vTasker task management system. The API is versioned and currently at v1.

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens should be included in the `Authorization` header of requests:

```
Authorization: Bearer <token>
```

### Check Email

Check if an email is already registered.

```http
POST /auth/check-email
```

#### Request Body
```json
{
  "email": "string"  // required, valid email format
}
```

#### Response
```json
{
  "exists": boolean
}
```

Status: 200 OK

### Sign Up

Register a new user account.

```http
POST /auth/sign-up
```

#### Request Body
```json
{
  "email": "string",     // required, valid email format
  "password": "string",  // required, min length: 8
  "name": "string"       // required, min length: 1
}
```

#### Response
```json
{
  "token": "string",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string"
  }
}
```

Status: 201 Created

### Sign In

Authenticate a user and get an access token.

```http
POST /auth/sign-in
```

#### Request Body
```json
{
  "email": "string",     // required, valid email format
  "password": "string"   // required
}
```

#### Response
```json
{
  "token": "string",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string"
  }
}
```

Status: 200 OK

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
  "code": "string",  // error code for client-side handling
  "message": "string",
  "details": {}  // optional
}
```

Common error codes:
- `INVALID_CREDENTIALS`: Email or password is incorrect
- `EMAIL_TAKEN`: Email is already registered
- `INVALID_PASSWORD`: Password doesn't meet requirements
- `ACCOUNT_LOCKED`: Account has been locked
- `EMAIL_NOT_VERIFIED`: Email verification required
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `ACCOUNT_DISABLED`: Account has been disabled
- `SESSION_EXPIRED`: Authentication token has expired
- `INVALID_TOKEN`: Authentication token is invalid
- `SERVER_ERROR`: Internal server error

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
