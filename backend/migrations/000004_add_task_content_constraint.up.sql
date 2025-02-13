-- Add unique constraint on task_id in task_contents table
ALTER TABLE
    task_contents
ADD
    CONSTRAINT unique_task_content_per_task UNIQUE (task_id);