-- Create task statuses table
CREATE TABLE task_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#000000',
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Add default statuses
INSERT INTO
    task_statuses (name, description, color, "order")
VALUES
    (
        'To Do',
        'Tasks that need to be started',
        '#FF0000',
        0
    ),
    (
        'In Progress',
        'Tasks currently being worked on',
        '#FFA500',
        1
    ),
    ('Done', 'Completed tasks', '#00FF00', 2);

-- Add trigger for updated_at
CREATE TRIGGER update_task_statuses_updated_at BEFORE
UPDATE
    ON task_statuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add status_id and deleted_at to tasks table
ALTER TABLE
    tasks
ADD
    COLUMN status_id UUID REFERENCES task_statuses(id),
ADD
    COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Set default status for existing tasks
UPDATE
    tasks
SET
    status_id = (
        SELECT
            id
        FROM
            task_statuses
        WHERE
            name = 'To Do'
        LIMIT
            1
    );