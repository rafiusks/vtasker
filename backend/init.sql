-- Create the vtasker role
CREATE USER vtasker WITH PASSWORD 'vtasker_dev' SUPERUSER;

-- Create the database
CREATE DATABASE vtasker WITH OWNER vtasker;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE vtasker TO vtasker;

-- Connect to the vtasker database and create extensions
\ connect vtasker;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO vtasker;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vtasker;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vtasker;