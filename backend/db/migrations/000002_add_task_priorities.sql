-- Create task priorities table
CREATE TABLE IF NOT EXISTS task_priorities (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default priority values
INSERT INTO
    task_priorities (code, name, description, display_order)
VALUES
    (
        'low',
        'Low',
        'Low priority tasks that can be addressed when time permits',
        1
    ),
    (
        'medium',
        'Medium',
        'Standard priority tasks that should be addressed in due course',
        2
    ),
    (
        'high',
        'High',
        'High priority tasks that require immediate attention',
        3
    ) ON CONFLICT (code) DO NOTHING;

-- Add foreign key to tasks table
ALTER TABLE
    tasks
ADD
    COLUMN IF NOT EXISTS priority_id INTEGER REFERENCES task_priorities(id);