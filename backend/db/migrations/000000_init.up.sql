-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;

-- Grant necessary permissions
GRANT ALL ON SCHEMA public TO public;

GRANT ALL ON ALL TABLES IN SCHEMA public TO public;