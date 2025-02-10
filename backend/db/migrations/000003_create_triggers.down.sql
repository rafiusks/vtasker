-- Drop triggers
DROP TRIGGER IF EXISTS update_acceptance_criteria_updated_at ON acceptance_criteria;

DROP TRIGGER IF EXISTS update_task_contents_updated_at ON task_contents;

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;

DROP TRIGGER IF EXISTS update_task_types_updated_at ON task_types;

DROP TRIGGER IF EXISTS update_task_priorities_updated_at ON task_priorities;

DROP TRIGGER IF EXISTS update_task_statuses_updated_at ON task_statuses;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();