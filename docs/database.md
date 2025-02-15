# Database Documentation

## Overview

vTasker uses PostgreSQL as its primary database. The schema is designed to support a task management system with projects, issues, and comments.

## Schema

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Projects Table

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Issues Table

```sql
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'todo',
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    project_id UUID NOT NULL REFERENCES projects(id),
    assignee_id UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high'))
);
```

### Comments Table

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    issue_id UUID NOT NULL REFERENCES issues(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

The following indexes are created to optimize query performance:

```sql
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_issues_project_id ON issues(project_id);
CREATE INDEX idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_comments_issue_id ON comments(issue_id);
```

## Automatic Updates

A trigger function updates the `updated_at` timestamp whenever a record is modified:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

This trigger is applied to all tables:
```sql
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Relationships

1. **Users & Projects**
   - A user can create multiple projects (one-to-many)
   - `projects.created_by` references `users.id`

2. **Projects & Issues**
   - A project can have multiple issues (one-to-many)
   - `issues.project_id` references `projects.id`

3. **Users & Issues**
   - A user can create multiple issues (one-to-many)
   - A user can be assigned to multiple issues (one-to-many)
   - `issues.created_by` references `users.id`
   - `issues.assignee_id` references `users.id`

4. **Issues & Comments**
   - An issue can have multiple comments (one-to-many)
   - `comments.issue_id` references `issues.id`
   - `comments.created_by` references `users.id`

## Data Types

- **UUID**: Used for all ID fields, generated using `uuid-generate-v4()`
- **VARCHAR(255)**: Used for names, emails, and other short text fields
- **TEXT**: Used for descriptions and comment content
- **TIMESTAMP WITH TIME ZONE**: Used for all date/time fields
- **BOOLEAN**: Used for flags like `is_archived`

## Constraints

1. **Status Values**
   - todo
   - in_progress
   - in_review
   - done

2. **Priority Values**
   - low
   - medium
   - high

## Development Setup

1. Start the database:
```bash
docker-compose up -d postgres
```

2. Connect to the database:
```bash
psql -h localhost -U vtasker -d vtasker
# Password: vtasker_dev
```

3. Run migrations:
```bash
cd backend
migrate -path migrations -database "postgres://vtasker:vtasker_dev@localhost:5432/vtasker?sslmode=disable" up
```
