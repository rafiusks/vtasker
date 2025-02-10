-- Remove NOT NULL constraint from type_id column
ALTER TABLE
    tasks
ALTER COLUMN
    type_id DROP NOT NULL;

-- No need to revert the task type updates since they are valid data changes