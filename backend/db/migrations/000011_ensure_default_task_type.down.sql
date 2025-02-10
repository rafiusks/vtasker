-- No need to remove the default task type as it's a core type
-- Just mark tasks with default type as NULL
UPDATE
    tasks
SET
    type_id = NULL
WHERE
    type_id = (
        SELECT
            id
        FROM
            task_types
        WHERE
            code = 'feature'
    );