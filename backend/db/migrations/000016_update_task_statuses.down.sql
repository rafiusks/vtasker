-- Revert to original statuses
DELETE FROM
    task_statuses;

INSERT INTO
    task_statuses (id, name, description, color, "order")
VALUES
    (
        1,
        'To Do',
        'Tasks that need to be started',
        '#FF0000',
        0
    ),
    (
        2,
        'In Progress',
        'Tasks currently being worked on',
        '#FFA500',
        1
    ),
    (
        3,
        'Done',
        'Completed tasks',
        '#00FF00',
        2
    );

-- Drop the code column
ALTER TABLE
    task_statuses DROP COLUMN IF EXISTS code;