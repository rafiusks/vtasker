-- Add role validations
ALTER TABLE
    users
ADD
    CONSTRAINT users_role_check CHECK (role IN ('admin', 'user'));

ALTER TABLE
    task_collaborators
ADD
    CONSTRAINT task_collaborators_role_check CHECK (role IN ('viewer', 'editor', 'admin'));