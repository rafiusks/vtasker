-- Ensure the task_types table exists
CREATE TABLE IF NOT EXISTS task_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert or update default task types
INSERT INTO
    task_types (code, name, description, display_order)
VALUES
    (
        'feature',
        'Feature',
        'New feature or enhancement',
        1
    ),
    ('bug', 'Bug', 'Bug fix or issue resolution', 2),
    (
        'chore',
        'Chore',
        'Maintenance or housekeeping task',
        3
    ) ON CONFLICT (code) DO
UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- Add foreign key constraint if it doesn't exist
DO $ $ BEGIN IF NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.table_constraints
    WHERE
        constraint_name = 'tasks_type_id_fkey'
) THEN
ALTER TABLE
    tasks
ADD
    CONSTRAINT tasks_type_id_fkey FOREIGN KEY (type_id) REFERENCES task_types(id);

END IF;

END;

$ $;