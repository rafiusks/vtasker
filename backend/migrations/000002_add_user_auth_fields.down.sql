-- Remove authentication-related fields from users table
ALTER TABLE
    users DROP COLUMN is_verified,
    DROP COLUMN is_locked,
    DROP COLUMN failed_login_attempts,
    DROP COLUMN last_login_at;