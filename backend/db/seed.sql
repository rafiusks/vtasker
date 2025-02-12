-- Seed task statuses
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
        'Tasks that are planned but not yet ready to be worked on',
        '#E2E8F0',
        'inbox',
        0
    ),
    (
        'todo',
        'To Do',
        'Tasks that are ready to be worked on',
        '#F3F4F6',
        'list',
        1
    ),
    (
        'in_progress',
        'In Progress',
        'Tasks that are currently being worked on',
        '#DBEAFE',
        'clock',
        2
    ),
    (
        'in_review',
        'In Review',
        'Tasks that are being reviewed',
        '#FEF3C7',
        'eye',
        3
    ),
    (
        'done',
        'Done',
        'Tasks that have been completed',
        '#DCFCE7',
        'check-circle',
        4
    ),
    (
        'blocked',
        'Blocked',
        'Tasks that are blocked by dependencies or other issues',
        '#FEE2E2',
        'x-circle',
        5
    );

-- Seed task priorities
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
        'Tasks that are not urgent and can be done when time permits',
        '#E2E8F0',
        'arrow-down',
        0
    ),
    (
        'medium',
        'Medium',
        'Tasks that should be done soon but are not urgent',
        '#FEF3C7',
        'minus',
        1
    ),
    (
        'high',
        'High',
        'Tasks that are urgent and should be done as soon as possible',
        '#FEE2E2',
        'arrow-up',
        2
    ),
    (
        'critical',
        'Critical',
        'Tasks that are extremely urgent and must be done immediately',
        '#DC2626',
        'exclamation-circle',
        3
    );

-- Seed task types
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
        'New functionality or enhancement',
        '#DBEAFE',
        'sparkles',
        0
    ),
    (
        'bug',
        'Bug',
        'Something that needs to be fixed',
        '#FEE2E2',
        'bug',
        1
    ),
    (
        'chore',
        'Chore',
        'Maintenance tasks or updates',
        '#E2E8F0',
        'wrench',
        2
    ),
    (
        'task',
        'Task',
        'General task or work item',
        '#F3F4F6',
        'clipboard',
        3
    ),
    (
        'epic',
        'Epic',
        'Large initiative containing multiple tasks',
        '#F3E8FF',
        'collection',
        4
    ),
    (
        'story',
        'Story',
        'User story or feature from user perspective',
        '#DCFCE7',
        'user',
        5
    );