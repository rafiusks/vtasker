-- Add authentication-related fields to users table
ALTER TABLE
    users
ADD
    COLUMN is_verified BOOLEAN NOT NULL DEFAULT false,
ADD
    COLUMN is_locked BOOLEAN NOT NULL DEFAULT false,
ADD
    COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0,
ADD
    COLUMN last_login_at TIMESTAMP WITH TIME ZONE;