-- Drop indexes
DROP INDEX IF EXISTS idx_tasks_status_id;

DROP INDEX IF EXISTS idx_tasks_priority_id;

DROP INDEX IF EXISTS idx_tasks_type_id;

DROP INDEX IF EXISTS idx_tasks_owner_id;

DROP INDEX IF EXISTS idx_tasks_parent_id;

DROP INDEX IF EXISTS idx_task_contents_task_id;

DROP INDEX IF EXISTS idx_task_labels_task_id;

DROP INDEX IF EXISTS idx_task_dependencies_task_id;

DROP INDEX IF EXISTS idx_task_dependencies_dependency_id;

DROP INDEX IF EXISTS idx_acceptance_criteria_task_id;

DROP INDEX IF EXISTS idx_task_collaborators_task_id;

DROP INDEX IF EXISTS idx_task_collaborators_user_id;

DROP INDEX IF EXISTS idx_users_email;