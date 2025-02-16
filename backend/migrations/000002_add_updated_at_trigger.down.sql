-- Drop triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;

DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();