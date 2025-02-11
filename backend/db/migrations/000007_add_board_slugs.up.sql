-- Add slug column to boards table
ALTER TABLE
    boards
ADD
    COLUMN slug VARCHAR(255);

-- Create unique index for slug
CREATE UNIQUE INDEX idx_boards_slug ON boards(slug);

-- Update existing boards with slugs based on name
UPDATE
    boards
SET
    slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));

-- Make slug required for future inserts
ALTER TABLE
    boards
ALTER COLUMN
    slug
SET
    NOT NULL;