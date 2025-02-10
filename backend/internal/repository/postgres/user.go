package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/backend/internal/models/user"
	"github.com/rafaelzasas/vtasker/backend/internal/repository"
)

// UserRepository implements repository.UserRepository using PostgreSQL
type UserRepository struct {
	db *pgxpool.Pool
}

// NewUserRepository creates a new PostgreSQL user repository
func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(ctx context.Context, user *user.User) error {
	query := `
		INSERT INTO users (
			id, email, username, password_hash, full_name, avatar_url, role,
			created_at, updated_at, last_login_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)`

	_, err := r.db.Exec(ctx, query,
		user.ID, user.Email, user.Username, user.PasswordHash,
		user.FullName, user.AvatarURL, user.Role,
		user.CreatedAt, user.UpdatedAt, user.LastLoginAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
	query := `
		SELECT id, email, username, password_hash, full_name, avatar_url, role,
			created_at, updated_at, last_login_at
		FROM users
		WHERE id = $1`

	var u user.User
	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Email, &u.Username, &u.PasswordHash,
		&u.FullName, &u.AvatarURL, &u.Role,
		&u.CreatedAt, &u.UpdatedAt, &u.LastLoginAt,
	)

	if err == pgx.ErrNoRows {
		return nil, repository.ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	return &u, nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*user.User, error) {
	query := `
		SELECT id, email, username, password_hash, full_name, avatar_url, role,
			created_at, updated_at, last_login_at
		FROM users
		WHERE email = $1`

	var u user.User
	err := r.db.QueryRow(ctx, query, email).Scan(
		&u.ID, &u.Email, &u.Username, &u.PasswordHash,
		&u.FullName, &u.AvatarURL, &u.Role,
		&u.CreatedAt, &u.UpdatedAt, &u.LastLoginAt,
	)

	if err == pgx.ErrNoRows {
		return nil, repository.ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return &u, nil
}

// GetByUsername retrieves a user by username
func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*user.User, error) {
	query := `
		SELECT id, email, username, password_hash, full_name, avatar_url, role,
			created_at, updated_at, last_login_at
		FROM users
		WHERE username = $1`

	var u user.User
	err := r.db.QueryRow(ctx, query, username).Scan(
		&u.ID, &u.Email, &u.Username, &u.PasswordHash,
		&u.FullName, &u.AvatarURL, &u.Role,
		&u.CreatedAt, &u.UpdatedAt, &u.LastLoginAt,
	)

	if err == pgx.ErrNoRows {
		return nil, repository.ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user by username: %w", err)
	}

	return &u, nil
}

// Update updates an existing user
func (r *UserRepository) Update(ctx context.Context, user *user.User) error {
	query := `
		UPDATE users
		SET email = $1, username = $2, password_hash = $3,
			full_name = $4, avatar_url = $5, role = $6,
			updated_at = $7, last_login_at = $8
		WHERE id = $9`

	result, err := r.db.Exec(ctx, query,
		user.Email, user.Username, user.PasswordHash,
		user.FullName, user.AvatarURL, user.Role,
		user.UpdatedAt, user.LastLoginAt, user.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	if result.RowsAffected() == 0 {
		return repository.ErrNotFound
	}

	return nil
}

// Delete deletes a user by ID
func (r *UserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	if result.RowsAffected() == 0 {
		return repository.ErrNotFound
	}

	return nil
}

// UpdateLastLogin updates the last login timestamp for a user
func (r *UserRepository) UpdateLastLogin(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE users
		SET last_login_at = NOW()
		WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	if result.RowsAffected() == 0 {
		return repository.ErrNotFound
	}

	return nil
}

// List retrieves all users with optional filtering
func (r *UserRepository) List(ctx context.Context, filter repository.UserFilter) ([]*user.User, error) {
	var conditions []string
	var args []interface{}
	argCount := 1

	if filter.Role != nil {
		conditions = append(conditions, fmt.Sprintf("role = $%d", argCount))
		args = append(args, *filter.Role)
		argCount++
	}

	if filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		conditions = append(conditions, fmt.Sprintf("(username ILIKE $%d OR email ILIKE $%d OR full_name ILIKE $%d)", argCount, argCount, argCount))
		args = append(args, searchTerm)
		argCount++
	}

	query := `
		SELECT id, email, username, password_hash, full_name, avatar_url, role,
			created_at, updated_at, last_login_at
		FROM users`

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	if filter.OrderBy != "" {
		query += fmt.Sprintf(" ORDER BY %s %s", filter.OrderBy, filter.OrderDir)
	}

	if filter.Limit > 0 {
		query += fmt.Sprintf(" LIMIT %d", filter.Limit)
	}

	if filter.Offset > 0 {
		query += fmt.Sprintf(" OFFSET %d", filter.Offset)
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}
	defer rows.Close()

	var users []*user.User
	for rows.Next() {
		var u user.User
		err := rows.Scan(
			&u.ID, &u.Email, &u.Username, &u.PasswordHash,
			&u.FullName, &u.AvatarURL, &u.Role,
			&u.CreatedAt, &u.UpdatedAt, &u.LastLoginAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user row: %w", err)
		}
		users = append(users, &u)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating user rows: %w", err)
	}

	return users, nil
} 