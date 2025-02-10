# Database Documentation

## Implementation Status

### Currently Active Tables
- ✅ `users` - Fully implemented with authentication
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

## Overview
The application uses PostgreSQL as its database system. This document outlines the database schema, including tables, relationships, indexes, triggers, and other database objects.

## Tables

### users
Stores user information and authentication details.
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | UUID | no | gen_random_uuid() | Primary key |
| email | VARCHAR(255) | no | | Unique email address |
| password_hash | VARCHAR(255) | no | | Bcrypt hashed password |
| name | VARCHAR(100) | no | | User's full name |
| avatar_url | VARCHAR(255) | yes | | URL to user's avatar |
| role | VARCHAR(20) | no | 'user' | User role (admin/user) |
| created_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Last update timestamp |
| last_login_at | TIMESTAMP WITH TIME ZONE | yes | | Last login timestamp |

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

### tasks
Main tasks table.
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | UUID | no | gen_random_uuid() | Primary key |
| title | VARCHAR(255) | no | | Task title |
| description | TEXT | yes | | Task description |
| status_id | INTEGER | yes | | Reference to task_statuses |
| priority_id | INTEGER | yes | | Reference to task_priorities |
| type_id | INTEGER | yes | | Reference to task_types |
| owner_id | UUID | yes | | Reference to users |
| parent_id | UUID | yes | | Reference to parent task |
| order_index | INTEGER | no | 0 | Display order within status |
| created_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Last update timestamp |

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

### task_collaborators
Manages task collaborators and their roles.
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| task_id | UUID | no | | Reference to tasks |
| user_id | UUID | no | | Reference to users |
| role | VARCHAR(20) | no | 'viewer' | Collaborator role |
| created_at | TIMESTAMP WITH TIME ZONE | no | CURRENT_TIMESTAMP | Creation timestamp |

## Indexes
- `idx_tasks_status_id` on `tasks(status_id)`
- `idx_tasks_priority_id` on `tasks(priority_id)`
- `idx_tasks_type_id` on `tasks(type_id)`
- `idx_tasks_owner_id` on `tasks(owner_id)`
- `idx_tasks_parent_id` on `tasks(parent_id)`
- `idx_task_contents_task_id` on `task_contents(task_id)`
- `idx_task_labels_task_id` on `task_labels(task_id)`
- `idx_task_dependencies_task_id` on `task_dependencies(task_id)`
- `idx_task_dependencies_dependency_id` on `task_dependencies(dependency_id)`
- `idx_acceptance_criteria_task_id` on `acceptance_criteria(task_id)`
- `idx_task_collaborators_task_id` on `task_collaborators(task_id)`
- `idx_task_collaborators_user_id` on `task_collaborators(user_id)`
- `idx_users_email` on `users(email)`

## Triggers
1. `update_updated_at_column()` function:
   - Updates `updated_at` to current timestamp whenever a record is modified
   - Applied to tables:
     - task_statuses
     - task_priorities
     - task_types
     - users
     - tasks
     - task_contents
     - acceptance_criteria

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
