ALTER TABLE tasks
ADD CONSTRAINT fk_task_status
FOREIGN KEY (status_id) REFERENCES task_statuses(id)
ON DELETE RESTRICT;

ALTER TABLE tasks
ADD CONSTRAINT task_order_positive
CHECK ("order" >= 0);

CREATE UNIQUE INDEX idx_task_position 
ON tasks (status_id, "order") 
WHERE deleted_at IS NULL; 