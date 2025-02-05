ALTER TABLE
    tasks DROP COLUMN IF EXISTS task_content,
    DROP COLUMN IF EXISTS relationships,
    DROP COLUMN IF EXISTS metadata,
    DROP COLUMN IF EXISTS progress;