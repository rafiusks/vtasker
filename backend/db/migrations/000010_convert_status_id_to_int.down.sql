-- Create a temporary mapping table to store integer to UUID mappings
CREATE TABLE task_status_id_mapping (
    old_id INTEGER PRIMARY KEY,
    new_id UUID NOT NULL DEFAULT gen_random_uuid()
);

-- Insert existing status mappings
INSERT INTO
    task_status_id_mapping (old_id)
SELECT
    id
FROM
    task_statuses;

-- Add new UUID column to task_statuses
ALTER TABLE
    task_statuses
ADD
    COLUMN new_id UUID;

-- Update task_statuses with new UUIDs
UPDATE
    task_statuses ts
SET
    new_id = m.new_id
FROM
    task_status_id_mapping m
WHERE
    ts.id = m.old_id;

-- Add new UUID column to tasks
ALTER TABLE
    tasks
ADD
    COLUMN new_status_id UUID;

-- Update tasks with new status UUIDs
UPDATE
    tasks t
SET
    new_status_id = m.new_id
FROM
    task_status_id_mapping m
WHERE
    t.status_id = m.old_id;

-- Drop foreign key constraint
ALTER TABLE
    tasks DROP CONSTRAINT IF EXISTS fk_tasks_status;

-- Drop the old status_id column from tasks
ALTER TABLE
    tasks DROP COLUMN status_id;

-- Rename new_status_id to status_id in tasks
ALTER TABLE
    tasks RENAME COLUMN new_status_id TO status_id;

-- Drop primary key constraint on task_statuses
ALTER TABLE
    task_statuses DROP CONSTRAINT task_statuses_pkey;

-- Drop the old id column from task_statuses
ALTER TABLE
    task_statuses DROP COLUMN id;

-- Rename new_id to id in task_statuses
ALTER TABLE
    task_statuses RENAME COLUMN new_id TO id;

-- Add primary key constraint to task_statuses
ALTER TABLE
    task_statuses
ADD
    PRIMARY KEY (id);

-- Add foreign key constraint
ALTER TABLE
    tasks
ADD
    CONSTRAINT fk_tasks_status FOREIGN KEY (status_id) REFERENCES task_statuses(id);

-- Drop the temporary mapping table
DROP TABLE task_status_id_mapping;