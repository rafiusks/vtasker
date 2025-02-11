-- Create indexes
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_users_role_id ON users(role_id);

CREATE INDEX idx_boards_slug ON boards(slug);

CREATE INDEX idx_boards_owner_id ON boards(owner_id);

CREATE INDEX idx_board_members_user_id ON board_members(user_id);

CREATE INDEX idx_tasks_status_id ON tasks(status_id);

CREATE INDEX idx_tasks_priority_id ON tasks(priority_id);

CREATE INDEX idx_tasks_type_id ON tasks(type_id);

CREATE INDEX idx_tasks_owner_id ON tasks(owner_id);

CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);

CREATE INDEX idx_tasks_board_id ON tasks(board_id);

CREATE INDEX idx_task_contents_task_id ON task_contents(task_id);

CREATE INDEX idx_task_labels_task_id ON task_labels(task_id);

CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);

CREATE INDEX idx_task_dependencies_dependency_id ON task_dependencies(dependency_id);

CREATE INDEX idx_acceptance_criteria_task_id ON acceptance_criteria(task_id);

CREATE INDEX idx_task_collaborators_task_id ON task_collaborators(task_id);

CREATE INDEX idx_task_collaborators_user_id ON task_collaborators(user_id);