CREATE TABLE IF NOT EXISTS task_types (
    id SERIAL PRIMARY KEY,
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE
    tasks DROP COLUMN IF EXISTS type;

ALTER TABLE
    tasks
ADD
    COLUMN type_id integer REFERENCES task_types(id);

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
    ('chore', 'Chore', 'Maintenance task', 4) ON CONFLICT (code) DO NOTHING;