# Database Documentation

_Last updated: 2024-02-16 05:46 UTC_
_Reason: Updated schema documentation to reflect current database structure, added indexes for performance optimization, and included development setup instructions_

## Overview

vTasker uses PostgreSQL as its primary database. The schema is designed to support project management, issue tracking, and user management features.

## Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### Projects Table
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_created_at ON projects(created_at);
```

### Issues Table
```sql
CREATE TYPE issue_status AS ENUM ('todo', 'in_progress', 'in_review', 'done');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID NOT NULL REFERENCES projects(id),
    status issue_status NOT NULL DEFAULT 'todo',
    priority issue_priority NOT NULL DEFAULT 'medium',
    assignee_id UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issues_project_id ON issues(project_id);
CREATE INDEX idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_created_at ON issues(created_at);
```

### Comments Table
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    issue_id UUID NOT NULL REFERENCES issues(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_issue_id ON comments(issue_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

## Migrations

Migrations are managed using golang-migrate. Migration files are stored in the `backend/migrations` directory.

### Current Migrations
1. `001_create_users.up.sql` - Create users table
2. `002_create_projects.up.sql` - Create projects table
3. `003_create_issues.up.sql` - Create issues table
4. `004_create_comments.up.sql` - Create comments table

### Running Migrations
```bash
# Apply all migrations
make migrate-up

# Rollback last migration
make migrate-down

# Create new migration
make migrate-create name=add_new_table
```

## Indexes

### Performance Indexes
- `users.email` - Fast user lookup
- `projects.name` - Project search
- `projects.created_at` - Timeline sorting
- `issues.project_id` - Project-issue relationship
- `issues.status` - Status filtering
- `comments.issue_id` - Issue-comment relationship

### Foreign Key Indexes
- `projects.created_by -> users.id`
- `issues.project_id -> projects.id`
- `issues.assignee_id -> users.id`
- `issues.created_by -> users.id`
- `comments.issue_id -> issues.id`