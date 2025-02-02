-- Delete test task (cascading will handle related records)
DELETE FROM
    tasks
WHERE
    external_id = 'task-1';