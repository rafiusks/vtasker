-- Remove default data
DELETE FROM
    task_statuses
WHERE
    code IN (
        'backlog',
        'todo',
        'in_progress',
        'review',
        'done'
    );

DELETE FROM
    task_priorities
WHERE
    code IN ('low', 'medium', 'high', 'critical');

DELETE FROM
    task_types
WHERE
    code IN ('feature', 'bug', 'chore', 'docs');