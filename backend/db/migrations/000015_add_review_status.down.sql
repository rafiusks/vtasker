-- Delete Review status
DELETE FROM
    task_statuses
WHERE
    id = 3;

-- Move Done status back to ID 3
UPDATE
    task_statuses
SET
    id = 3
WHERE
    id = 4;

-- Update order values
UPDATE
    task_statuses
SET
    "order" = id - 1;