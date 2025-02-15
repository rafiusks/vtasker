package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/vtasker/internal/models"
)

var (
	ErrUserNotFound = errors.New("user not found")
)

// UserRepository defines the interface for user database operations
type UserRepository interface {
	CheckEmailExists(ctx context.Context, email string) (bool, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// PostgresUserRepository implements UserRepository for PostgreSQL
type PostgresUserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new PostgreSQL user repository
func NewUserRepository(db *sql.DB) UserRepository {
	return &PostgresUserRepository{db: db}
}

// CheckEmailExists checks if an email exists in the database
func (r *PostgresUserRepository) CheckEmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.db.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", email).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

// GetByEmail retrieves a user by their email
func (r *PostgresUserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	user := &models.User{}
	err := r.db.QueryRowContext(ctx, `
		SELECT id, email, name, password_hash, is_verified, is_locked, failed_login_attempts, 
		last_login_at, created_at, updated_at 
		FROM users WHERE email = $1
	`, email).Scan(
		&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.IsVerified,
		&user.IsLocked, &user.FailedLoginAttempts, &user.LastLoginAt,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

// Create inserts a new user into the database
func (r *PostgresUserRepository) Create(ctx context.Context, user *models.User) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO users (email, name, password_hash, is_verified, is_locked, failed_login_attempts)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, user.Email, user.Name, user.PasswordHash, user.IsVerified, user.IsLocked, user.FailedLoginAttempts)
	return err
}

// GetByID retrieves a user by their ID
func (r *PostgresUserRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	query := `
		SELECT id, email, name, password_hash, avatar_url, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	user := &models.User{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.PasswordHash,
		&user.AvatarURL,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

// Update updates an existing user
func (r *PostgresUserRepository) Update(ctx context.Context, user *models.User) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE users 
		SET name = $1, password_hash = $2, is_verified = $3, is_locked = $4, 
		failed_login_attempts = $5, last_login_at = $6, updated_at = CURRENT_TIMESTAMP
		WHERE id = $7
	`, user.Name, user.PasswordHash, user.IsVerified, user.IsLocked,
		user.FailedLoginAttempts, user.LastLoginAt, user.ID)
	return err
}

// Delete deletes a user
func (r *PostgresUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
} 