package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/backend/internal/models/user"
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	// Create creates a new user
	Create(ctx context.Context, user *user.User) error

	// GetByID retrieves a user by ID
	GetByID(ctx context.Context, id uuid.UUID) (*user.User, error)

	// GetByEmail retrieves a user by email
	GetByEmail(ctx context.Context, email string) (*user.User, error)

	// GetByUsername retrieves a user by username
	GetByUsername(ctx context.Context, username string) (*user.User, error)

	// Update updates an existing user
	Update(ctx context.Context, user *user.User) error

	// Delete deletes a user by ID
	Delete(ctx context.Context, id uuid.UUID) error

	// UpdateLastLogin updates the last login timestamp for a user
	UpdateLastLogin(ctx context.Context, id uuid.UUID) error

	// List retrieves all users with optional filtering
	List(ctx context.Context, filter UserFilter) ([]*user.User, error)

	// GetPool returns the database connection pool
	GetPool() *pgxpool.Pool
}

// UserFilter defines the filter options for listing users
type UserFilter struct {
	Role     *string // Role code (super_admin, admin, user)
	Search   string  // Search in email or full name
	Limit    int
	Offset   int
	OrderBy  string
	OrderDir string
}
