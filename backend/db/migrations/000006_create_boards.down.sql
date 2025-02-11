-- Drop indexes
DROP INDEX IF EXISTS idx_boards_owner_id;

DROP INDEX IF EXISTS idx_tasks_board_id;

DROP INDEX IF EXISTS idx_board_members_user_id;

-- Drop trigger
DROP TRIGGER IF EXISTS update_boards_updated_at ON boards;

-- Remove board_id from tasks
ALTER TABLE
    tasks DROP COLUMN IF EXISTS board_id;

-- Drop tables
DROP TABLE IF EXISTS board_members;

DROP TABLE IF EXISTS boards;