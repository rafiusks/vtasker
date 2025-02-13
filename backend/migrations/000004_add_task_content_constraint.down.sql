-- Remove unique constraint on task_id in task_contents table
ALTER TABLE
    task_contents DROP CONSTRAINT IF EXISTS unique_task_content_per_task;