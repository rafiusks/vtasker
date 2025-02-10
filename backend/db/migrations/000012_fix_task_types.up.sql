-- Ensure default task type exists and is properly set
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

-- Update tasks without a type to use the default type
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

-- Add a NOT NULL constraint to the type_id column
ALTER TABLE
    tasks
ALTER COLUMN
    type_id
SET
    NOT NULL;