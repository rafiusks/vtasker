ALTER TABLE
    tasks
ADD
    COLUMN IF NOT EXISTS external_id VARCHAR(50) UNIQUE;

ALTER TABLE
    task_dependencies
ADD
    COLUMN IF NOT EXISTS dependency_external_id VARCHAR(50) REFERENCES tasks(external_id);