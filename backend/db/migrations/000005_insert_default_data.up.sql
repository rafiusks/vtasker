-- Insert default task statuses
INSERT INTO
    task_statuses (
        code,
        name,
        description,
        color,
        icon,
        display_order
    )
VALUES
    (
        'backlog',
        'Backlog',
        'Tasks that need to be prioritized',
        '#6B7280',
        'inbox',
        0
    ),
    (
        'todo',
        'To Do',
        'Tasks ready to be worked on',
        '#3B82F6',
        'list',
        1
    ),
    (
        'in_progress',
        'In Progress',
        'Tasks currently being worked on',
        '#10B981',
        'clock',
        2
    ),
    (
        'review',
        'Review',
        'Tasks that need to be reviewed',
        '#F59E0B',
        'eye',
        3
    ),
    (
        'done',
        'Done',
        'Completed tasks',
        '#059669',
        'check',
        4
    ) ON CONFLICT (code) DO NOTHING;

-- Insert default task priorities
INSERT INTO
    task_priorities (
        code,
        name,
        description,
        color,
        icon,
        display_order
    )
VALUES
    (
        'low',
        'Low',
        'Low priority tasks',
        '#6B7280',
        'arrow-down',
        0
    ),
    (
        'medium',
        'Medium',
        'Medium priority tasks',
        '#F59E0B',
        'minus',
        1
    ),
    (
        'high',
        'High',
        'High priority tasks',
        '#EF4444',
        'arrow-up',
        2
    ),
    (
        'critical',
        'Critical',
        'Critical priority tasks',
        '#DC2626',
        'exclamation',
        3
    ) ON CONFLICT (code) DO NOTHING;

-- Insert default task types
INSERT INTO
    task_types (
        code,
        name,
        description,
        color,
        icon,
        display_order
    )
VALUES
    (
        'feature',
        'Feature',
        'New feature or enhancement',
        '#3B82F6',
        'sparkles',
        0
    ),
    (
        'bug',
        'Bug',
        'Bug fix or issue',
        '#EF4444',
        'bug',
        1
    ),
    (
        'chore',
        'Chore',
        'Maintenance task',
        '#6B7280',
        'wrench',
        2
    ),
    (
        'docs',
        'Documentation',
        'Documentation update',
        '#8B5CF6',
        'book',
        3
    ) ON CONFLICT (code) DO NOTHING;