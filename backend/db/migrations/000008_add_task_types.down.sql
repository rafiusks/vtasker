DROP TABLE IF EXISTS task_types;

ALTER TABLE
    tasks DROP COLUMN IF EXISTS type_id;

ALTER TABLE
    tasks
ADD
    COLUMN type text NOT NULL DEFAULT 'feature';