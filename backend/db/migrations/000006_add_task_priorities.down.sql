-- Recreate the task_priority enum type
CREATE TYPE task_priority AS ENUM ('low', 'normal', 'high');

-- Add back the priority enum column
ALTER TABLE
    tasks
ADD
    COLUMN priority task_priority;

-- Migrate data back
UPDATE
    tasks t
SET
    priority = CAST(tp.code AS task_priority)
FROM
    task_priorities tp
WHERE
    t.priority_id = tp.id;

-- Make priority required and drop priority_id
ALTER TABLE
    tasks
ALTER COLUMN
    priority
SET
    NOT NULL,
    DROP COLUMN priority_id;

-- Drop the task_priorities table
DROP TABLE task_priorities;