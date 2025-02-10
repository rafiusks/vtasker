-- Drop tables in correct order
DROP TABLE IF EXISTS task_collaborators;

DROP TABLE IF EXISTS acceptance_criteria;

DROP TABLE IF EXISTS task_dependencies;

DROP TABLE IF EXISTS task_labels;

DROP TABLE IF EXISTS task_contents;

DROP TABLE IF EXISTS tasks;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS task_types;

DROP TABLE IF EXISTS task_priorities;

DROP TABLE IF EXISTS task_statuses;

-- Drop UUID extension
DROP EXTENSION IF EXISTS "uuid-ossp";