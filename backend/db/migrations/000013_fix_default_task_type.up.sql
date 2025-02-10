-- Drop any existing task_types constraints
ALTER TABLE
    tasks DROP CONSTRAINT IF EXISTS tasks_type_id_fkey;

-- Ensure the task_types table has the default type
INSERT INTO
    task_types (code, name, description, display_order)
VALUES
    (
        'feature',
        'Feature',
        'New feature or enhancement',
        1
    ) ON CONFLICT (code) DO
UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order RETURNING id;

-- Update all tasks without a valid type_id to use the default type
UPDATE
    tasks
SET
    type_id = (
        SELECT
            id
        FROM
            task_types
        WHERE
            code = 'feature'
    )
WHERE
    type_id IS NULL
    OR type_id NOT IN (
        SELECT
            id
        FROM
            task_types
    );

-- Add back the foreign key constraint
ALTER TABLE
    tasks
ADD
    CONSTRAINT tasks_type_id_fkey FOREIGN KEY (type_id) REFERENCES task_types(id) ON DELETE RESTRICT;

-- Set NOT NULL constraint on type_id
ALTER TABLE
    tasks
ALTER COLUMN
    type_id
SET
    NOT NULL;