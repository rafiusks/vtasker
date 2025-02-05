ALTER TABLE
    tasks DROP COLUMN IF EXISTS status_id,
    DROP COLUMN IF EXISTS deleted_at;

DROP TRIGGER IF EXISTS update_task_statuses_updated_at ON task_statuses;

DROP TABLE IF EXISTS task_statuses;