-- Create task_statuses table
CREATE TABLE IF NOT EXISTS task_statuses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert default statuses
INSERT INTO
    task_statuses (code, name, display_order)
VALUES
    ('backlog', 'Backlog', 0),
    ('in-progress', 'In Progress', 1),
    ('review', 'Review', 2),
    ('done', 'Done', 3);

-- Add status_id column to tasks table
ALTER TABLE
    tasks
ADD
    COLUMN status_id INT REFERENCES task_statuses(id);

-- Migrate existing status data
UPDATE
    tasks t
SET
    status_id = ts.id
FROM
    task_statuses ts
WHERE
    t.status = ts.code;

-- Update status_history table to use status_ids
ALTER TABLE
    status_history
ADD
    COLUMN from_status_id INT REFERENCES task_statuses(id),
ADD
    COLUMN to_status_id INT REFERENCES task_statuses(id);

-- Migrate existing status history data
UPDATE
    status_history sh
SET
    from_status_id = ts_from.id,
    to_status_id = ts_to.id
FROM
    task_statuses ts_from,
    task_statuses ts_to
WHERE
    sh.from_status = ts_from.code
    AND sh.to_status = ts_to.code;

-- Make status_id required and drop old status column
ALTER TABLE
    tasks
ALTER COLUMN
    status_id
SET
    NOT NULL,
    DROP COLUMN status;

-- Update status_history to use only status_ids
ALTER TABLE
    status_history
ALTER COLUMN
    from_status_id
SET
    NOT NULL,
ALTER COLUMN
    to_status_id
SET
    NOT NULL,
    DROP COLUMN from_status,
    DROP COLUMN to_status;