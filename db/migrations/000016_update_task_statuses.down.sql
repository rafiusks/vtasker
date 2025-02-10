-- Add temporary column to store old status IDs
ALTER TABLE
    tasks
ADD
    COLUMN temp_old_status_id INTEGER;

-- Store old status IDs
UPDATE
    tasks
SET
    temp_old_status_id = status_id
WHERE
    status_id IN (1, 2, 3, 4);

-- First, create a temporary status to hold tasks during the transition
INSERT INTO
    task_statuses (id, name, description, color, "order")
VALUES
    (
        999,
        'Temporary',
        'Temporary status for migration',
        '#000000',
        999
    );

-- Move all tasks to the temporary status
UPDATE
    tasks
SET
    status_id = 999
WHERE
    status_id IN (1, 2, 3, 4);

-- Now we can safely delete the old statuses
DELETE FROM
    task_statuses
WHERE
    id != 999;

-- Revert to original statuses
INSERT INTO
    task_statuses (id, name, description, color, "order")
VALUES
    (
        1,
        'To Do',
        'Tasks that need to be started',
        '#FF0000',
        0
    ),
    (
        2,
        'In Progress',
        'Tasks currently being worked on',
        '#FFA500',
        1
    ),
    (
        3,
        'Done',
        'Completed tasks',
        '#00FF00',
        2
    );

-- Update tasks to use the old status IDs based on their current status
UPDATE
    tasks
SET
    status_id = CASE
        WHEN status_id = 999
        AND temp_old_status_id = 1 THEN 1 -- New "Backlog" -> Old "To Do"
        WHEN status_id = 999
        AND temp_old_status_id = 2 THEN 2 -- New "In Progress" -> Old "In Progress"
        WHEN status_id = 999
        AND (
            temp_old_status_id = 3
            OR temp_old_status_id = 4
        ) THEN 3 -- New "Review" or "Done" -> Old "Done"
        ELSE 1 -- Default to To Do if something goes wrong
    END;

-- Finally, remove the temporary status and column
DELETE FROM
    task_statuses
WHERE
    id = 999;

ALTER TABLE
    tasks DROP COLUMN temp_old_status_id;

-- Drop the code column
ALTER TABLE
    task_statuses DROP COLUMN IF EXISTS code;