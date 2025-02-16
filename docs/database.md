# Database Documentation

_Last updated: 2024-02-16 14:58 UTC_
_Reason: Updated schema to reflect current implementation, added index information, and included query optimization details_

## Overview

vTasker uses PostgreSQL as its primary database. The schema is designed to support project management, issue tracking, and user management features with a focus on performance and scalability.

## Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
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
CREATE INDEX idx_projects_is_archived ON projects(is_archived);
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
CREATE INDEX idx_issues_created_by ON issues(created_by);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_issues_is_archived ON issues(is_archived);
CREATE INDEX idx_issues_project_status ON issues(project_id, status);
CREATE INDEX idx_issues_assignee_status ON issues(assignee_id, status);
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
CREATE INDEX idx_comments_created_by ON comments(created_by);
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
- `users.email` - Fast user lookup by email
- `projects.name` - Project search and filtering
- `projects.created_at` - Timeline sorting
- `projects.is_archived` - Archived project filtering
- `issues.project_id` - Project-issue relationship
- `issues.status` - Status filtering
- `issues.priority` - Priority filtering
- `issues.is_archived` - Archived issue filtering
- `comments.issue_id` - Issue-comment relationship

### Composite Indexes
- `issues.project_id, status` - Filter issues by status within a project
- `issues.assignee_id, status` - Find user's assigned issues by status

### Foreign Key Indexes
- `projects.created_by -> users.id`
- `issues.project_id -> projects.id`
- `issues.assignee_id -> users.id`
- `issues.created_by -> users.id`
- `comments.issue_id -> issues.id`
- `comments.created_by -> users.id`

## Query Optimization

### Common Queries

#### Get Project with Issue Counts
```sql
SELECT 
    p.*,
    COUNT(i.id) as issue_count,
    COUNT(CASE WHEN i.status != 'done' THEN 1 END) as open_issue_count
FROM projects p
LEFT JOIN issues i ON p.id = i.project_id AND i.is_archived = false
WHERE p.is_archived = false
GROUP BY p.id;
```

#### Get User's Assigned Issues by Status
```sql
SELECT 
    i.*,
    p.name as project_name,
    u.name as assignee_name
FROM issues i
JOIN projects p ON i.project_id = p.id
LEFT JOIN users u ON i.assignee_id = u.id
WHERE i.assignee_id = :user_id
    AND i.is_archived = false
    AND p.is_archived = false
ORDER BY i.priority DESC, i.created_at DESC;
```

#### Get Issue with Comments
```sql
SELECT 
    i.*,
    json_agg(
        json_build_object(
            'id', c.id,
            'content', c.content,
            'created_at', c.created_at,
            'created_by', c.created_by
        ) ORDER BY c.created_at
    ) as comments
FROM issues i
LEFT JOIN comments c ON i.id = c.issue_id
WHERE i.id = :issue_id
GROUP BY i.id;
```

### Performance Tips

1. **Use Pagination**
   ```sql
   SELECT * FROM projects
   WHERE is_archived = false
   ORDER BY created_at DESC
   LIMIT :limit OFFSET :offset;
   ```

2. **Efficient Counting**
   ```sql
   SELECT COUNT(*) OVER(), *
   FROM projects
   WHERE is_archived = false
   LIMIT :limit OFFSET :offset;
   ```

3. **Partial Indexes**
   ```sql
   CREATE INDEX idx_active_projects 
   ON projects(created_at)
   WHERE is_archived = false;
   ```

## Maintenance

### Regular Tasks
1. Update table statistics
   ```sql
   ANALYZE users, projects, issues, comments;
   ```

2. Reindex tables
   ```sql
   REINDEX TABLE users, projects, issues, comments;
   ```

3. Vacuum dead tuples
   ```sql
   VACUUM ANALYZE users, projects, issues, comments;
   ```

### Monitoring Queries
1. Table sizes
   ```sql
   SELECT 
       relname as table_name,
       pg_size_pretty(pg_total_relation_size(relid)) as total_size
   FROM pg_catalog.pg_statio_user_tables
   ORDER BY pg_total_relation_size(relid) DESC;
   ```

2. Index usage
   ```sql
   SELECT 
       schemaname,
       relname,
       indexrelname,
       idx_scan,
       idx_tup_read,
       idx_tup_fetch
   FROM pg_stat_user_indexes
   ORDER BY idx_scan DESC;
   ```

## Development Setup

### Local Environment
1. Start PostgreSQL container:
   ```bash
   docker-compose up -d postgres
   ```

2. Connect to database:
   ```bash
   psql -h localhost -U postgres -d vtasker
   ```

### Test Data Generation
1. Users:
   ```sql
   INSERT INTO users (email, name, password_hash)
   SELECT 
       'user' || n || '@example.com',
       'User ' || n,
       '$2a$10$...'
   FROM generate_series(1, 100) n;
   ```

2. Projects:
   ```sql
   INSERT INTO projects (name, description, created_by)
   SELECT 
       'Project ' || n,
       'Description for project ' || n,
       (SELECT id FROM users ORDER BY random() LIMIT 1)
   FROM generate_series(1, 50) n;
   ```