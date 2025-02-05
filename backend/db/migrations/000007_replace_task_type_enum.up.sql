-- Create task_types table
CREATE TABLE task_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add type_id column to tasks table
ALTER TABLE
    tasks DROP COLUMN type;

ALTER TABLE
    tasks
ADD
    COLUMN type_id INTEGER REFERENCES task_types(id);

-- Insert default task types
INSERT INTO
    task_types (code, name, description, display_order)
VALUES
    (
        'feature',
        'Feature',
        'New feature or enhancement',
        1
    ),
    ('bug', 'Bug', 'Bug fix', 2),
    (
        'docs',
        'Documentation',
        'Documentation update',
        3
    ),
    ('chore', 'Chore', 'Maintenance task', 4);