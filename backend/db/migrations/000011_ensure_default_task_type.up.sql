-- Ensure default task type exists
INSERT INTO
    task_types (code, name, description, display_order)
VALUES
    (
        'feature',
        'Feature',
        'New feature or enhancement',
        1
    ) ON CONFLICT (code) DO NOTHING;

-- Set default type_id for tasks without a type
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
    type_id IS NULL;