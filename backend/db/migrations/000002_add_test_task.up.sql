-- Insert test task and get its ID
WITH new_task AS (
    INSERT INTO
        tasks (
            external_id,
            title,
            description,
            status,
            priority,
            type,
            "order"
        )
    VALUES
        (
            'task-1',
            'Test Task',
            'This is a test task to verify frontend-backend integration',
            'backlog',
            'normal',
            'feature',
            0
        ) RETURNING id
) -- Insert task content
INSERT INTO
    task_contents (
        task_id,
        description,
        implementation_details,
        notes
    )
SELECT
    id,
    'Detailed description of the test task',
    'Implementation details go here',
    'Additional notes'
FROM
    new_task;

-- Insert labels
WITH task_id AS (
    SELECT
        id
    FROM
        tasks
    WHERE
        external_id = 'task-1'
)
INSERT INTO
    task_labels (task_id, label)
SELECT
    id,
    unnest(ARRAY ['test', 'integration'])
FROM
    task_id;

-- Insert acceptance criteria
WITH task_id AS (
    SELECT
        id
    FROM
        tasks
    WHERE
        external_id = 'task-1'
)
INSERT INTO
    acceptance_criteria (task_id, description, "order")
SELECT
    id,
    description,
    "order"
FROM
    task_id
    CROSS JOIN (
        VALUES
            ('First acceptance criterion', 0),
            ('Second acceptance criterion', 1)
    ) AS criteria(description, "order");