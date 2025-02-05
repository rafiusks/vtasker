ALTER TABLE tasks DROP COLUMN IF EXISTS external_id;
ALTER TABLE task_dependencies DROP COLUMN IF EXISTS dependency_external_id; 