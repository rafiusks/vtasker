-- Add back the status columns
ALTER TABLE
    tasks
ADD
    COLUMN status VARCHAR(50);

ALTER TABLE
    status_history
ADD
    COLUMN from_status VARCHAR(50),
ADD
    COLUMN to_status VARCHAR(50);

-- Migrate data back to string status
UPDATE
    tasks t
SET
    status = ts.code
FROM
    task_statuses ts
WHERE
    t.status_id = ts.id;

-- Migrate status history data back to strings
UPDATE
    status_history sh
SET
    from_status = ts_from.code,
    to_status = ts_to.code
FROM
    task_statuses ts_from,
    task_statuses ts_to
WHERE
    sh.from_status_id = ts_from.id
    AND sh.to_status_id = ts_to.id;

-- Drop the status_id columns
ALTER TABLE
    tasks DROP COLUMN status_id;

ALTER TABLE
    status_history DROP COLUMN from_status_id,
    DROP COLUMN to_status_id;

-- Drop the task_statuses table
DROP TABLE task_statuses;