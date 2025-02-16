# Entity Relationships

_Last updated: 2024-02-16 03:30 UTC_
_Reason: Updated entity relationships documentation to reflect current data model, added detailed examples of database queries, and included cascade behaviors_

## Overview

This document provides a detailed explanation of the relationships between core entities in the vTasker system. Understanding these relationships is crucial for developers working with the system's data model and API.

## Core Entities

### 1. Users

Users are the foundation of the system and represent the actors who interact with all other entities.

#### Key Attributes
- `id` (UUID): Primary identifier
- `email` (VARCHAR): Unique email address
- `name` (VARCHAR): Display name
- `password_hash` (VARCHAR): Bcrypt hashed password
- `avatar_url` (VARCHAR): Optional profile picture
- `created_at` (TIMESTAMP): Account creation time
- `updated_at` (TIMESTAMP): Last update time

#### Relationships
- **Projects (as creator)**: One-to-Many
  - A user can create multiple projects
  - Each project must have exactly one creator
  - Relationship maintained via `projects.created_by`

- **Issues (as creator)**: One-to-Many
  - A user can create multiple issues
  - Each issue must have exactly one creator
  - Relationship maintained via `issues.created_by`

- **Issues (as assignee)**: One-to-Many
  - A user can be assigned to multiple issues
  - Each issue can have at most one assignee
  - Relationship maintained via `issues.assignee_id`
  - This is an optional relationship (issues can be unassigned)

- **Comments**: One-to-Many
  - A user can create multiple comments
  - Each comment must have exactly one creator
  - Relationship maintained via `comments.created_by`

### 2. Projects

Projects are organizational units that contain related issues/tasks.

#### Key Attributes
- `id` (UUID): Primary identifier
- `name` (VARCHAR): Project name
- `description` (TEXT): Project details
- `created_by` (UUID): Reference to creator user
- `is_archived` (BOOLEAN): Soft deletion flag
- `created_at` (TIMESTAMP): Creation time
- `updated_at` (TIMESTAMP): Last update time

#### Relationships
- **Creator User**: Many-to-One
  - Each project belongs to exactly one creator user
  - Relationship maintained via `created_by` foreign key
  - Deletion of user should be prevented if they have projects

- **Issues**: One-to-Many
  - A project can contain multiple issues
  - Each issue must belong to exactly one project
  - Relationship maintained via `issues.project_id`
  - When a project is archived, all its issues should be archived

### 3. Issues (Tasks)

Issues represent individual work items or tasks within a project.

#### Key Attributes
- `id` (UUID): Primary identifier
- `title` (VARCHAR): Issue title
- `description` (TEXT): Issue details
- `status` (VARCHAR): Current state (todo, in_progress, in_review, done)
- `priority` (VARCHAR): Importance level (low, medium, high)
- `project_id` (UUID): Reference to parent project
- `assignee_id` (UUID): Reference to assigned user (optional)
- `created_by` (UUID): Reference to creator user
- `is_archived` (BOOLEAN): Soft deletion flag
- `created_at` (TIMESTAMP): Creation time
- `updated_at` (TIMESTAMP): Last update time

#### Relationships
- **Project**: Many-to-One
  - Each issue belongs to exactly one project
  - Relationship maintained via `project_id` foreign key
  - Archiving a project should archive all its issues

- **Creator User**: Many-to-One
  - Each issue has exactly one creator
  - Relationship maintained via `created_by` foreign key
  - Deletion of user should be prevented if they have created issues

- **Assignee User**: Many-to-One (Optional)
  - Each issue can have at most one assignee
  - Relationship maintained via `assignee_id` foreign key
  - This is an optional relationship (NULL allowed)
  - Users can be unassigned from issues

- **Comments**: One-to-Many
  - An issue can have multiple comments
  - Comments are ordered by creation time
  - When an issue is archived, its comments remain for audit purposes

### 4. Comments

Comments provide discussion threads on issues.

#### Key Attributes
- `id` (UUID): Primary identifier
- `content` (TEXT): Comment content
- `issue_id` (UUID): Reference to parent issue
- `created_by` (UUID): Reference to creator user
- `created_at` (TIMESTAMP): Creation time
- `updated_at` (TIMESTAMP): Last update time

#### Relationships
- **Issue**: Many-to-One
  - Each comment belongs to exactly one issue
  - Relationship maintained via `issue_id` foreign key
  - Comments remain when issues are archived (for audit purposes)

- **Creator User**: Many-to-One
  - Each comment has exactly one creator
  - Relationship maintained via `created_by` foreign key
  - Deletion of user should be prevented if they have created comments

## Cascade Behaviors

### Soft Deletion (Archiving)
- When a project is archived:
  - The project's `is_archived` flag is set to true
  - All issues in the project are also archived
  - Comments remain unchanged for audit purposes

- When an issue is archived:
  - The issue's `is_archived` flag is set to true
  - Comments remain unchanged for audit purposes

### Hard Deletion (Database Level)
- Users cannot be deleted if they:
  - Have created projects
  - Have created issues
  - Have created comments
  - Are assigned to issues

- Projects cannot be deleted if they:
  - Have issues (archived or not)

- Issues cannot be deleted if they:
  - Have comments

## Data Integrity Rules

1. **Required Fields**
   - All entities require: id, created_at, updated_at
   - Projects require: name, created_by
   - Issues require: title, project_id, created_by, status, priority
   - Comments require: content, issue_id, created_by

2. **Status Values**
   - Issues can only have status values:
     - todo
     - in_progress
     - in_review
     - done

3. **Priority Values**
   - Issues can only have priority values:
     - low
     - medium
     - high

4. **Timestamps**
   - created_at is set automatically on record creation
   - updated_at is updated automatically on record modification

## Performance Considerations

1. **Indexes**
   - Foreign key columns (created_by, project_id, issue_id, assignee_id)
   - Frequently queried fields (status, priority, is_archived)
   - Timestamp columns for sorting (created_at, updated_at)

2. **Composite Indexes**
   - (project_id, status) for filtering issues by status within a project
   - (assignee_id, status) for finding a user's assigned issues by status

## Example Queries

### Get all active issues assigned to a user
```sql
SELECT i.*
FROM issues i
WHERE i.assignee_id = :user_id
  AND i.is_archived = false
ORDER BY i.created_at DESC;
```

### Get project statistics
```sql
SELECT 
  p.id,
  p.name,
  COUNT(i.id) as total_issues,
  SUM(CASE WHEN i.status = 'done' THEN 1 ELSE 0 END) as completed_issues
FROM projects p
LEFT JOIN issues i ON p.id = i.project_id
WHERE p.is_archived = false
GROUP BY p.id, p.name;
```

### Get issue with its comments
```sql
SELECT 
  i.*,
  json_agg(
    json_build_object(
      'id', c.id,
      'content', c.content,
      'created_at', c.created_at,
      'created_by', c.created_by
    )
  ) as comments
FROM issues i
LEFT JOIN comments c ON i.id = c.issue_id
WHERE i.id = :issue_id
GROUP BY i.id;
``` 