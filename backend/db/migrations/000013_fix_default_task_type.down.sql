-- Remove NOT NULL constraint from type_id
ALTER TABLE
    tasks
ALTER COLUMN
    type_id DROP NOT NULL;

-- Drop the foreign key constraint
ALTER TABLE
    tasks DROP CONSTRAINT IF EXISTS tasks_type_id_fkey;

-- No need to remove data from task_types as it might be referenced by other tasks