-- Drop the foreign key constraint if it exists
ALTER TABLE
    tasks DROP CONSTRAINT IF EXISTS tasks_type_id_fkey;

-- Delete the default task types
DELETE FROM
    task_types
WHERE
    code IN ('feature', 'bug', 'chore');