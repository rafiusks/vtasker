-- Restore task priorities schema
ALTER TABLE
    task_priorities
ADD
    COLUMN IF NOT EXISTS code VARCHAR(50),
ADD
    COLUMN IF NOT EXISTS description TEXT,
ADD
    COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD
    COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Restore original priority names and display order
UPDATE
    task_priorities
SET
    name = 'Low Priority',
    display_order = 0
WHERE
    id = 1;

UPDATE
    task_priorities
SET
    name = 'Normal Priority',
    display_order = 1
WHERE
    id = 2;

UPDATE
    task_priorities
SET
    name = 'High Priority',
    display_order = 2
WHERE
    id = 3;