-- Drop triggers
DROP TRIGGER IF EXISTS update_acceptance_criteria_updated_at ON acceptance_criteria;

DROP TRIGGER IF EXISTS update_task_contents_updated_at ON task_contents;

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

DROP TRIGGER IF EXISTS update_boards_updated_at ON boards;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop tables in reverse order
DROP TABLE IF EXISTS error_logs;

DROP TABLE IF EXISTS system_metrics;

DROP TABLE IF EXISTS audit_logs;

DROP TABLE IF EXISTS activity_logs;

DROP TABLE IF EXISTS task_collaborators;

DROP TABLE IF EXISTS acceptance_criteria;

DROP TABLE IF EXISTS task_dependencies;

DROP TABLE IF EXISTS task_labels;

DROP TABLE IF EXISTS task_contents;

DROP TABLE IF EXISTS tasks;

DROP TABLE IF EXISTS task_types;

DROP TABLE IF EXISTS task_priorities;

DROP TABLE IF EXISTS task_statuses;

DROP TABLE IF EXISTS board_members;

DROP TABLE IF EXISTS boards;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS user_roles;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop extensions
DROP EXTENSION IF EXISTS "uuid-ossp";