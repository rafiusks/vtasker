-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Task status enum
CREATE TYPE task_status AS ENUM ('backlog', 'in-progress', 'review', 'done');

-- Task priority enum
CREATE TYPE task_priority AS ENUM ('low', 'normal', 'high');

-- Task type enum
CREATE TYPE task_type AS ENUM ('feature', 'bug', 'docs', 'chore');

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'backlog',
    priority task_priority NOT NULL DEFAULT 'normal',
    type task_type NOT NULL DEFAULT 'feature',
    "order" INTEGER NOT NULL DEFAULT 0,
    parent_id VARCHAR(50) REFERENCES tasks(external_id),
    board VARCHAR(50),
    column_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Task content table
CREATE TABLE task_contents (
    task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
    description TEXT,
    implementation_details TEXT,
    notes TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    assignee VARCHAR(100)
);

-- Task labels
CREATE TABLE task_labels (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    PRIMARY KEY (task_id, label)
);

-- Task dependencies
CREATE TABLE task_dependencies (
    dependent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_external_id VARCHAR(50) REFERENCES tasks(external_id) ON DELETE CASCADE,
    PRIMARY KEY (dependent_task_id, dependency_external_id)
);

-- Task attachments
CREATE TABLE task_attachments (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    attachment_path VARCHAR(255) NOT NULL,
    PRIMARY KEY (task_id, attachment_path)
);

-- Acceptance criteria
CREATE TABLE acceptance_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "order" INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(50),
    notes TEXT
);

-- Status history
CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    from_status task_status NOT NULL,
    to_status task_status NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    comment TEXT
);

-- Indexes
CREATE INDEX idx_tasks_external_id ON tasks(external_id);

CREATE INDEX idx_tasks_status ON tasks(status);

CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);

CREATE INDEX idx_tasks_board ON tasks(board);

CREATE INDEX idx_acceptance_criteria_task_id ON acceptance_criteria(task_id);

CREATE INDEX idx_status_history_task_id ON status_history(task_id);

-- Function to update updated_at timestamp
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS '
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE
UPDATE
    ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acceptance_criteria_updated_at BEFORE
UPDATE
    ON acceptance_criteria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();