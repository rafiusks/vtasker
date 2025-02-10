-- Update Done status ID to 4
UPDATE
    task_statuses
SET
    id = 4
WHERE
    name = 'Done';

-- Insert Review status with ID 3
INSERT INTO
    task_statuses (id, name, description, color, "order")
VALUES
    (
        3,
        'Review',
        'Tasks that need to be reviewed',
        '#FFA500',
        2
    );

-- Update order values to match IDs
UPDATE
    task_statuses
SET
    "order" = id - 1;