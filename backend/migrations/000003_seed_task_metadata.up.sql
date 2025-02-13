-- Seed task statuses
INSERT INTO task_statuses (code, name, description, color, display_order)
VALUES
    ('backlog', 'Backlog', 'Tasks that are not yet started', '#6B7280', 1),
    ('in-progress', 'In Progress', 'Tasks that are currently being worked on', '#3B82F6', 2),
    ('review', 'Review', 'Tasks that are ready for review', '#F59E0B', 3),
    ('done', 'Done', 'Tasks that are completed', '#10B981', 4);

-- Seed task priorities
INSERT INTO task_priorities (code, name, description, color, display_order)
VALUES
    ('low', 'Low', 'Tasks that are not urgent', '#6B7280', 1),
    ('medium', 'Medium', 'Tasks with normal priority', '#F59E0B', 2),
    ('high', 'High', 'Tasks that need attention soon', '#EF4444', 3),
    ('urgent', 'Urgent', 'Tasks that need immediate attention', '#DC2626', 4);

-- Seed task types
INSERT INTO task_types (code, name, description, color, display_order)
VALUES
    ('feature', 'Feature', 'New functionality to be added', '#3B82F6', 1),
    ('bug', 'Bug', 'Something that needs to be fixed', '#EF4444', 2),
    ('chore', 'Chore', 'Maintenance tasks', '#6B7280', 3),
    ('docs', 'Documentation', 'Documentation updates', '#8B5CF6', 4); 