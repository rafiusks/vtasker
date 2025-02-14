-- Drop triggers
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;

DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables
DROP TABLE IF EXISTS comments;

DROP TABLE IF EXISTS issues;

DROP TABLE IF EXISTS projects;

DROP TABLE IF EXISTS users;

-- Drop extensions
DROP EXTENSION IF EXISTS "uuid-ossp";