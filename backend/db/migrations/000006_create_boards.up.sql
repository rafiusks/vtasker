-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE
    SET
        NULL,
        is_public BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create board_members table for collaborators
CREATE TABLE IF NOT EXISTS board_members (
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer',
    -- viewer, editor, admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (board_id, user_id),
    CONSTRAINT board_members_role_check CHECK (role IN ('viewer', 'editor', 'admin'))
);

-- Add board_id to tasks table
ALTER TABLE
    tasks
ADD
    COLUMN board_id UUID REFERENCES boards(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_boards_owner_id ON boards(owner_id);

CREATE INDEX IF NOT EXISTS idx_tasks_board_id ON tasks(board_id);

CREATE INDEX IF NOT EXISTS idx_board_members_user_id ON board_members(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_boards_updated_at BEFORE
UPDATE
    ON boards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();