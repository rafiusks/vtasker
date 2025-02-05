ALTER TABLE
    tasks
ADD
    CONSTRAINT fk_task_status FOREIGN KEY (status_id) REFERENCES task_statuses(id) ON DELETE RESTRICT;

ALTER TABLE
    tasks
ADD
    CONSTRAINT task_order_positive CHECK ("order" >= 0);

-- Drop the old index if it exists
DROP INDEX IF EXISTS idx_task_position;

-- Create a new index that excludes deleted tasks and handles order values correctly
CREATE UNIQUE INDEX idx_task_position ON tasks (status_id, "order", id)
WHERE
    deleted_at IS NULL;