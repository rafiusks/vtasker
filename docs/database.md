# Database Documentation

## Implementation Status

### Currently Active Tables
- ✅ `users` - Fully implemented with authentication
- ✅ `user_roles` - Implemented with default roles
- ✅ `boards` - Basic board management implemented
- ✅ `board_members` - Board membership implemented
- ✅ `task_statuses` - Implemented with default statuses
- ✅ `task_priorities` - Implemented with default priorities
- ✅ `task_types` - Implemented with default types
- ✅ `tasks` - Basic task management implemented
- ✅ `task_contents` - Basic content management implemented

### Planned/Not Yet Implemented
- 🔄 `task_labels` - For task categorization and filtering
- 🔄 `task_dependencies` - For tracking task relationships
- 🔄 `acceptance_criteria` - For task completion criteria
- 🔄 `task_collaborators` - For team collaboration on tasks
- 🔄 `activity_logs` - For tracking user and system activities
- 🔄 `audit_logs` - For tracking super admin actions
- 🔄 `system_metrics` - For monitoring system performance
- 🔄 `error_logs` - For tracking system errors

## Overview
The application uses PostgreSQL as its database system. This document outlines the database schema, including tables, relationships, indexes, triggers, and other database objects.

## Tables

### User Roles
- `id` (SERIAL, Primary Key): Unique identifier for the role
- `code` (VARCHAR(50), Unique): Role code identifier
  - Values: 'super_admin', 'admin', 'user'
- `name` (VARCHAR(100)): Display name for the role
- `description` (TEXT): Role description
- `created_at` (TIMESTAMP WITH TIME ZONE): When the role was created
- `updated_at` (TIMESTAMP WITH TIME ZONE): When the role was last updated

### Users
- `id` (UUID, Primary Key): Unique identifier for the user
- `email` (VARCHAR(255), Unique): User's email address
- `password_hash` (VARCHAR(255)): Hashed password
- `full_name` (VARCHAR(255)): User's full name
- `avatar_url` (VARCHAR(255)): URL to user's avatar image
- `role_id` (INTEGER, Foreign Key): Reference to user_roles.id
- `created_at` (TIMESTAMP WITH TIME ZONE): When the user was created
- `updated_at` (TIMESTAMP WITH TIME ZONE): When the user was last updated
- `last_login_at` (TIMESTAMP WITH TIME ZONE): When the user last logged in

### Boards
- `id` (UUID, Primary Key): Unique identifier for the board
- `name` (VARCHAR(255)): Board name
- `slug` (VARCHAR(255), Unique): URL-friendly identifier
- `description` (TEXT): Board description
- `owner_id` (UUID, Foreign Key): Reference to users.id
- `is_public` (BOOLEAN): Whether the board is publicly accessible
- `created_at` (TIMESTAMP WITH TIME ZONE): When the board was created
- `updated_at` (TIMESTAMP WITH TIME ZONE): When the board was last updated

### Board Members
- `board_id` (UUID, Foreign Key): Reference to boards.id
- `user_id` (UUID, Foreign Key): Reference to users.id
- `role` (ENUM): Member's role in the board
  - Values: 'admin', 'editor', 'viewer'
- `created_at` (TIMESTAMP WITH TIME ZONE): When the member was added

### Tasks
- `id` (UUID, Primary Key): Unique identifier for the task
- `title` (VARCHAR(255)): Task title
- `description` (TEXT): Task description
- `status_id` (INTEGER): Task status
- `priority_id` (INTEGER): Task priority
- `type_id` (INTEGER): Task type
- `owner_id` (UUID, Foreign Key): Reference to users.id
- `parent_id` (UUID, Foreign Key): Reference to tasks.id for subtasks
- `board_id` (UUID, Foreign Key): Reference to boards.id
- `order_index` (INTEGER): Position in the board
- `created_at` (TIMESTAMP WITH TIME ZONE): When the task was created
- `updated_at` (TIMESTAMP WITH TIME ZONE): When the task was last updated

### task_contents
Stores detailed task content.
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | UUID | no | gen_random_uuid() | Primary key |
| task_id | UUID | no | | Reference to tasks |
| description | TEXT | yes | | Detailed description |
| implementation_details | TEXT | yes | | Implementation notes |
| notes | TEXT | yes | | Additional notes |
| attachments | JSONB | yes | | Array of attachment URLs |
| due_date | TIMESTAMP WITH TIME ZONE | yes | | Task due date |
| assignee | UUID | yes | | Reference to users |
| created_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Last update timestamp |

### task_statuses
Defines possible task statuses.
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | SERIAL | no | | Primary key |
| code | VARCHAR(50) | no | | Unique status code |
| name | VARCHAR(100) | no | | Display name |
| description | TEXT | yes | | Status description |
| color | VARCHAR(7) | yes | | Color code (hex) |
| icon | VARCHAR(50) | yes | | Icon identifier |
| display_order | INTEGER | no | 0 | Display order |
| created_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Last update timestamp |

### task_priorities
Defines task priority levels.
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | SERIAL | no | | Primary key |
| code | VARCHAR(50) | no | | Unique priority code |
| name | VARCHAR(100) | no | | Display name |
| description | TEXT | yes | | Priority description |
| color | VARCHAR(7) | yes | | Color code (hex) |
| icon | VARCHAR(50) | yes | | Icon identifier |
| display_order | INTEGER | no | 0 | Display order |
| created_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Last update timestamp |

### task_types
Defines different types of tasks.
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | SERIAL | no | | Primary key |
| code | VARCHAR(50) | no | | Unique type code |
| name | VARCHAR(100) | no | | Display name |
| description | TEXT | yes | | Type description |
| color | VARCHAR(7) | yes | | Color code (hex) |
| icon | VARCHAR(50) | yes | | Icon identifier |
| display_order | INTEGER | no | 0 | Display order |
| created_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Last update timestamp |

### task_labels
Stores task labels/tags.
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | UUID | no | gen_random_uuid() | Primary key |
| task_id | UUID | no | | Reference to tasks |
| label | VARCHAR(50) | no | | Label text |
| created_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Creation timestamp |

### task_dependencies
Tracks dependencies between tasks.
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | UUID | no | gen_random_uuid() | Primary key |
| task_id | UUID | no | | Reference to dependent task |
| dependency_id | UUID | no | | Reference to required task |
| created_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Creation timestamp |
| UNIQUE(task_id, dependency_id) | | | | Composite primary key |

### acceptance_criteria
Stores task acceptance criteria.
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | UUID | no | gen_random_uuid() | Primary key |
| task_id | UUID | no | | Reference to tasks |
| description | TEXT | no | | Criterion description |
| completed | BOOLEAN | no | false | Completion status |
| completed_at | TIMESTAMP WITH TIME ZONE | yes | | Completion timestamp |
| completed_by | UUID | yes | | Reference to users |
| order_index | INTEGER | no | 0 | Display order |
| category | TEXT | yes | | Criterion category |
| notes | TEXT | yes | | Additional notes |
| created_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Last update timestamp |

### task_collaborators
Manages task collaborators and their roles.
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| task_id | UUID | no | | Reference to tasks |
| user_id | UUID | no | | Reference to users |
| role | VARCHAR(20) | no | 'viewer' | Collaborator role |
| created_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Creation timestamp |

### Activity Logs
- `id` (UUID, Primary Key): Unique identifier for the log entry
- `actor_id` (UUID, Foreign Key): Reference to users.id who performed the action
- `entity_type` (VARCHAR(50)): Type of entity (user, board, task, etc.)
- `entity_id` (UUID): ID of the affected entity
- `action` (VARCHAR(50)): Type of action (create, update, delete, etc.)
- `details` (JSONB): Additional details about the action
- `ip_address` (VARCHAR(45)): IP address of the actor
- `user_agent` (VARCHAR(255)): User agent of the actor
- `created_at` (TIMESTAMP WITH TIME ZONE): When the action occurred

### Audit Logs
- `id` (UUID, Primary Key): Unique identifier for the audit entry
- `admin_id` (UUID, Foreign Key): Reference to users.id (super admin)
- `action` (VARCHAR(50)): Type of action performed
- `entity_type` (VARCHAR(50)): Type of entity affected
- `entity_id` (UUID): ID of the affected entity
- `previous_state` (JSONB): State before the change
- `new_state` (JSONB): State after the change
- `ip_address` (VARCHAR(45)): IP address of the admin
- `user_agent` (VARCHAR(255)): User agent of the admin
- `created_at` (TIMESTAMP WITH TIME ZONE): When the action occurred

### System Metrics
- `id` (UUID, Primary Key): Unique identifier for the metric entry
- `metric_type` (VARCHAR(50)): Type of metric (cpu, memory, db_connections, etc.)
- `value` (NUMERIC): Metric value
- `unit` (VARCHAR(20)): Unit of measurement
- `labels` (JSONB): Additional labels/tags for the metric
- `timestamp` (TIMESTAMP WITH TIME ZONE): When the metric was recorded

### Error Logs
- `id` (UUID, Primary Key): Unique identifier for the error
- `error_type` (VARCHAR(50)): Type of error
- `severity` (VARCHAR(20)): Error severity (info, warning, error, fatal)
- `message` (TEXT): Error message
- `stack_trace` (TEXT): Stack trace if available
- `context` (JSONB): Additional context about the error
- `created_at` (TIMESTAMP WITH TIME ZONE): When the error occurred

## Relationships

### Users
- One-to-Many with Boards (as owner)
- One-to-Many with Tasks (as owner)
- Many-to-Many with Boards (through Board Members)
- Many-to-One with User Roles

### User Roles
- One-to-Many with Users
- Special roles:
  - super_admin: Full system access
  - admin: Administrative access
  - user: Standard access

### Boards
- Many-to-One with Users (owner)
- Many-to-Many with Users (through Board Members)
- One-to-Many with Tasks

### Tasks
- Many-to-One with Users (owner)
- Many-to-One with Boards
- One-to-Many with Tasks (subtasks)

### Activity Logs
- Many-to-One with Users (actor)
- Polymorphic relationship with various entities

### Audit Logs
- Many-to-One with Users (admin)
- Polymorphic relationship with various entities

## Indexes
- `users_email_idx` on users(email)
- `users_role_id_idx` on users(role_id)
- `boards_slug_idx` on boards(slug)
- `boards_owner_id_idx` on boards(owner_id)
- `board_members_board_user_idx` on board_members(board_id, user_id)
- `tasks_board_id_idx` on tasks(board_id)
- `tasks_owner_id_idx` on tasks(owner_id)

### Additional Indexes
- `idx_activity_logs_actor` on activity_logs(actor_id)
- `idx_activity_logs_entity` on activity_logs(entity_type, entity_id)
- `idx_activity_logs_created_at` on activity_logs(created_at)
- `idx_audit_logs_admin` on audit_logs(admin_id)
- `idx_audit_logs_entity` on audit_logs(entity_type, entity_id)
- `idx_audit_logs_created_at` on audit_logs(created_at)
- `idx_system_metrics_type` on system_metrics(metric_type)
- `idx_system_metrics_timestamp` on system_metrics(timestamp)
- `idx_error_logs_type` on error_logs(error_type)
- `idx_error_logs_severity` on error_logs(severity)
- `idx_error_logs_created_at` on error_logs(created_at)

## Triggers
- `update_updated_at`: Updates the updated_at timestamp when a record is modified
  - Applied to: users, boards, tasks, user_roles

## Constraints
1. Primary Keys on all tables
2. Foreign Key constraints with appropriate ON DELETE actions
3. Unique constraints:
   - `users(email)`
   - `task_statuses(code)`
   - `task_priorities(code)`
   - `task_types(code)`
   - `task_dependencies(task_id, dependency_id)`
   - `task_collaborators(task_id, user_id)`
4. Check constraints:
   - `users(role IN ('admin', 'user'))`
   - `task_collaborators(role IN ('viewer', 'editor', 'admin'))`

## Default Values
1. UUID generation using `gen_random_uuid()`
2. Timestamps using `CURRENT_TIMESTAMP`
3. Default roles:
   - users: 'user'
   - task_collaborators: 'viewer'
4. Default orders: 0 for all `order_index` and `display_order` columns

## Extensions
- `uuid-ossp`: For UUID generation

## Views
None currently defined.

## Types
- `user_role`: ENUM ('super_admin', 'admin', 'user')
- `board_member_role`: ENUM ('admin', 'editor', 'viewer')
- `task_status`: INTEGER references task_statuses(id)
- `task_priority`: INTEGER references task_priorities(id)
- `task_type`: INTEGER references task_types(id)
- `activity_type`: ENUM ('create', 'update', 'delete', 'login', 'logout', etc.)
- `audit_action`: ENUM ('user_role_change', 'board_delete', 'system_config_change', etc.)
- `metric_type`: ENUM ('cpu_usage', 'memory_usage', 'db_connections', 'api_latency', etc.)
- `error_severity`: ENUM ('info', 'warning', 'error', 'fatal')
