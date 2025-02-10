-- Create task_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS task_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default task types
INSERT INTO
    task_types (name, code, description, display_order)
VALUES
    (
        'Feature',
        'feature',
        'New feature or enhancement',
        0
    ),
    ('Bug', 'bug', 'Bug fix or issue resolution', 1),
    (
        'Documentation',
        'docs',
        'Documentation updates or improvements',
        2
    ),
    (
        'Chore',
        'chore',
        'Maintenance tasks and general updates',
        3
    ) ON CONFLICT (code) DO NOTHING;