-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO vtasker;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vtasker;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vtasker;