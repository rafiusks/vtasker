-- Drop role validations
ALTER TABLE
    task_collaborators DROP CONSTRAINT IF EXISTS task_collaborators_role_check;

ALTER TABLE
    users DROP CONSTRAINT IF EXISTS users_role_check;