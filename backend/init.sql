-- Create the vtasker role if it doesn't exist
DO $ $ BEGIN IF NOT EXISTS (
    SELECT
    FROM
        pg_catalog.pg_roles
    WHERE
        rolname = 'vtasker'
) THEN CREATE USER vtasker WITH PASSWORD 'vtasker_dev' SUPERUSER;

END IF;

END $ $;

-- Create the database if it doesn't exist
DO $ $ BEGIN IF NOT EXISTS (
    SELECT
    FROM
        pg_database
    WHERE
        datname = 'vtasker'
) THEN CREATE DATABASE vtasker WITH OWNER vtasker;

END IF;

END $ $;

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