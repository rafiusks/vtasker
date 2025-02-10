-- Add code column if it doesn't exist
ALTER TABLE task_statuses
ADD COLUMN IF NOT EXISTS code VARCHAR(50);

-- Add temporary column to store old status IDs
ALTER TABLE tasks
ADD COLUMN temp_old_status_id INTEGER;

-- Store old status IDs
UPDATE tasks
SET temp_old_status_id = status_id
WHERE status_id IN (1, 2, 3, 4);

-- First, create a temporary status to hold tasks during the transition
INSERT INTO task_statuses (id, name, code, description, color, "order")
VALUES (
    999,
    'Temporary',
    'temp',
    'Temporary status for migration',
    '#000000',
    999
);

-- Move all tasks to the temporary status
UPDATE tasks
SET status_id = 999
WHERE status_id IN (1, 2, 3, 4);

-- Now we can safely delete the old statuses
DELETE FROM task_statuses
WHERE id != 999;

-- Insert the standard statuses
INSERT INTO task_statuses (id, name, code, description, color, "order")
VALUES
    (
        1,
        'Backlog',
        'backlog',
        'Tasks that need to be started',
        '#E2E8F0',
        0
    ),
    (
        2,
        'In Progress',
        'in-progress',
        'Tasks currently being worked on',
        '#FCD34D',
        1
    ),
    (
        3,
        'Review',
        'review',
        'Tasks that need to be reviewed',
        '#93C5FD',
        2
    ),
    (
        4,
        'Done',
        'done',
        'Completed tasks',
        '#86EFAC',
        3
    );

-- Update tasks to use the new status IDs based on their previous status
UPDATE tasks
SET status_id = CASE
    WHEN status_id = 999 AND temp_old_status_id = 1 THEN 1  -- Old "To Do" -> New "Backlog"
    WHEN status_id = 999 AND temp_old_status_id = 2 THEN 2  -- Old "In Progress" -> New "In Progress"
    WHEN status_id = 999 AND temp_old_status_id = 3 THEN 4  -- Old "Done" -> New "Done"
    ELSE 1  -- Default to Backlog if something goes wrong
END;

-- Finally, remove the temporary status and column
DELETE FROM task_statuses WHERE id = 999;
ALTER TABLE tasks DROP COLUMN temp_old_status_id;
