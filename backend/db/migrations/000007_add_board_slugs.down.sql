-- Drop the unique index
DROP INDEX IF EXISTS idx_boards_slug;

-- Drop the slug column
ALTER TABLE
    boards DROP COLUMN IF EXISTS slug;