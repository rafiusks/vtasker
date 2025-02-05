-- Revert task constraints
ALTER TABLE
    tasks DROP CONSTRAINT IF EXISTS tasks_status_id_fkey,
    DROP CONSTRAINT IF EXISTS tasks_priority_id_fkey;