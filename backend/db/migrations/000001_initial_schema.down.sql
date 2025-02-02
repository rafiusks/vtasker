-- Drop triggers
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

DROP TRIGGER IF EXISTS update_acceptance_criteria_updated_at ON acceptance_criteria;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_tasks_external_id;

DROP INDEX IF EXISTS idx_tasks_status;

DROP INDEX IF EXISTS idx_tasks_parent_id;

DROP INDEX IF EXISTS idx_tasks_board;

DROP INDEX IF EXISTS idx_acceptance_criteria_task_id;

DROP INDEX IF EXISTS idx_status_history_task_id;

-- Drop tables
DROP TABLE IF EXISTS status_history;

DROP TABLE IF EXISTS acceptance_criteria;

DROP TABLE IF EXISTS task_attachments;

DROP TABLE IF EXISTS task_dependencies;

DROP TABLE IF EXISTS task_labels;

DROP TABLE IF EXISTS task_contents;

DROP TABLE IF EXISTS tasks;

-- Drop enums
DROP TYPE IF EXISTS task_status;

DROP TYPE IF EXISTS task_priority;

DROP TYPE IF EXISTS task_type;