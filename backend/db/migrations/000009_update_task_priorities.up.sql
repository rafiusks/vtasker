-- Update task priorities schema
-- First, drop unnecessary columns
ALTER TABLE
    task_priorities DROP COLUMN IF EXISTS code,
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- Update priority names to be more concise
UPDATE
    task_priorities
SET
    name = 'Low',
    display_order = 1
WHERE
    id = 1;

UPDATE
    task_priorities
SET
    name = 'Medium',
    display_order = 2
WHERE
    id = 2;

UPDATE
    task_priorities
SET
    name = 'High',
    display_order = 3
WHERE
    id = 3;