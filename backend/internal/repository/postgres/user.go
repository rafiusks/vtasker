package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/backend/internal/config"
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

// GetPool returns the database connection pool
func (r *UserRepository) GetPool() *pgxpool.Pool {
	return r.db
}

// Create creates a new user
func (r *UserRepository) Create(ctx context.Context, u *user.User) error {
	// Get default role ID for users
	var defaultRoleID int
	err := r.db.QueryRow(ctx, "SELECT id FROM user_roles WHERE code = $1", user.RoleCodeUser).Scan(&defaultRoleID)
	if err != nil {
		return fmt.Errorf("failed to get default role ID: %w", err)
	}

	// Check if user should be superadmin by email
	cfg := config.Load()
	if cfg.SuperAdminEmail != "" && u.Email == cfg.SuperAdminEmail {
		err = r.db.QueryRow(ctx, "SELECT id FROM user_roles WHERE code = $1", user.RoleCodeSuperAdmin).Scan(&u.RoleID)
		if err != nil {
			return fmt.Errorf("failed to get super admin role ID: %w", err)
		}
	} else if u.RoleID == 0 {
		u.RoleID = defaultRoleID
	}

	query := `
		INSERT INTO users (
			id, email, password_hash, full_name, avatar_url, role_id,
			created_at, updated_at, last_login_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9
		)`

	_, err = r.db.Exec(ctx, query,
		u.ID, u.Email, u.PasswordHash,
		u.FullName, u.AvatarURL, u.RoleID,
		u.CreatedAt, u.UpdatedAt, u.LastLoginAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
	query := `
		SELECT 
			u.id, u.email, u.password_hash, u.full_name, u.avatar_url, u.role_id,
			u.created_at, u.updated_at, u.last_login_at,
			r.id, r.code, r.name, r.description, r.created_at, r.updated_at
		FROM users u
		JOIN user_roles r ON r.id = u.role_id
		WHERE u.id = $1`

	var u user.User
	var role user.UserRole
	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Email, &u.PasswordHash,
		&u.FullName, &u.AvatarURL, &u.RoleID,
		&u.CreatedAt, &u.UpdatedAt, &u.LastLoginAt,
		&role.ID, &role.Code, &role.Name, &role.Description,
		&role.CreatedAt, &role.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, repository.ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	u.Role = &role
	return &u, nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*user.User, error) {
	query := `
		SELECT 
			u.id, u.email, u.password_hash, u.full_name, u.avatar_url, u.role_id,
			u.created_at, u.updated_at, u.last_login_at,
			r.id, r.code, r.name, r.description, r.created_at, r.updated_at
		FROM users u
		JOIN user_roles r ON r.id = u.role_id
		WHERE u.email = $1`

	var u user.User
	var role user.UserRole
	err := r.db.QueryRow(ctx, query, email).Scan(
		&u.ID, &u.Email, &u.PasswordHash,
		&u.FullName, &u.AvatarURL, &u.RoleID,
		&u.CreatedAt, &u.UpdatedAt, &u.LastLoginAt,
		&role.ID, &role.Code, &role.Name, &role.Description,
		&role.CreatedAt, &role.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, repository.ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	u.Role = &role
	return &u, nil
}

// GetByUsername retrieves a user by username
func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*user.User, error) {
	query := `
		SELECT 
			u.id, u.email, u.password_hash, u.full_name, u.avatar_url, u.role_id,
			u.created_at, u.updated_at, u.last_login_at,
			r.id, r.code, r.name, r.description, r.created_at, r.updated_at
		FROM users u
		JOIN user_roles r ON r.id = u.role_id
		WHERE u.email = $1`

	var u user.User
	var role user.UserRole
	err := r.db.QueryRow(ctx, query, username).Scan(
		&u.ID, &u.Email, &u.PasswordHash,
		&u.FullName, &u.AvatarURL, &u.RoleID,
		&u.CreatedAt, &u.UpdatedAt, &u.LastLoginAt,
		&role.ID, &role.Code, &role.Name, &role.Description,
		&role.CreatedAt, &role.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, repository.ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user by username: %w", err)
	}

	u.Role = &role
	return &u, nil
}

// Update updates an existing user
func (r *UserRepository) Update(ctx context.Context, u *user.User) error {
	// Get current user
	currentUser, err := r.GetByID(ctx, u.ID)
	if err != nil {
		return fmt.Errorf("failed to get current user: %w", err)
	}

	// Check if user is superadmin by email
	cfg := config.Load()
	isSuperAdmin := cfg.SuperAdminEmail != "" && u.Email == cfg.SuperAdminEmail

	// If user is superadmin by email, ensure role is superadmin
	if isSuperAdmin {
		err = r.db.QueryRow(ctx, "SELECT id FROM user_roles WHERE code = $1", user.RoleCodeSuperAdmin).Scan(&u.RoleID)
		if err != nil {
			return fmt.Errorf("failed to get super admin role ID: %w", err)
		}
	} else if currentUser.Role.Code == user.RoleCodeSuperAdmin && u.RoleID != currentUser.RoleID {
		// Prevent removing superadmin role if user is superadmin by email
		if currentUser.Email == cfg.SuperAdminEmail {
			return fmt.Errorf("cannot remove superadmin role from designated superadmin")
		}
	}

	query := `
		UPDATE users
		SET email = $1, password_hash = $2,
			full_name = $3, avatar_url = $4, role_id = $5,
			updated_at = $6, last_login_at = $7
		WHERE id = $8`

	result, err := r.db.Exec(ctx, query,
		u.Email, u.PasswordHash,
		u.FullName, u.AvatarURL, u.RoleID,
		u.UpdatedAt, u.LastLoginAt, u.ID,
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
	// Start a transaction
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// First, delete any board memberships
	_, err = tx.Exec(ctx, `DELETE FROM board_members WHERE user_id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete board memberships: %w", err)
	}

	// Then, delete any boards owned by the user
	_, err = tx.Exec(ctx, `DELETE FROM boards WHERE owner_id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete boards: %w", err)
	}

	// Finally, delete the user
	result, err := tx.Exec(ctx, `DELETE FROM users WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	if result.RowsAffected() == 0 {
		return repository.ErrNotFound
	}

	// Commit the transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
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
		conditions = append(conditions, fmt.Sprintf("r.code = $%d", argCount))
		args = append(args, *filter.Role)
		argCount++
	}

	if filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		conditions = append(conditions, fmt.Sprintf("(u.email ILIKE $%d OR u.full_name ILIKE $%d)", argCount, argCount))
		args = append(args, searchTerm)
		argCount++
	}

	query := `
		SELECT 
			u.id, u.email, u.password_hash, u.full_name, u.avatar_url, u.role_id,
			u.created_at, u.updated_at, u.last_login_at,
			r.id, r.code, r.name, r.description, r.created_at, r.updated_at
		FROM users u
		JOIN user_roles r ON r.id = u.role_id`

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
		var role user.UserRole
		err := rows.Scan(
			&u.ID, &u.Email, &u.PasswordHash,
			&u.FullName, &u.AvatarURL, &u.RoleID,
			&u.CreatedAt, &u.UpdatedAt, &u.LastLoginAt,
			&role.ID, &role.Code, &role.Name, &role.Description,
			&role.CreatedAt, &role.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user row: %w", err)
		}
		u.Role = &role
		users = append(users, &u)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating user rows: %w", err)
	}

	return users, nil
}

// ValidateAndEnsureSuperAdmin checks if the user should be a super admin based on email
// and updates their role if necessary
func (r *UserRepository) ValidateAndEnsureSuperAdmin(ctx context.Context, u *user.User) error {
	cfg := config.Load()
	if cfg.SuperAdminEmail != "" && u.Email == cfg.SuperAdminEmail {
		var roleID int
		err := r.db.QueryRow(ctx, "SELECT id FROM user_roles WHERE code = $1", user.RoleCodeSuperAdmin).Scan(&roleID)
		if err != nil {
			return fmt.Errorf("failed to get super admin role ID: %w", err)
		}

		if u.RoleID != roleID {
			u.RoleID = roleID
			// Update the role in the database
			query := `UPDATE users SET role_id = $1 WHERE id = $2`
			_, err := r.db.Exec(ctx, query, roleID, u.ID)
			if err != nil {
				return fmt.Errorf("failed to update super admin role: %w", err)
			}

			// Load the role information
			var role user.UserRole
			err = r.db.QueryRow(ctx, `
				SELECT id, code, name, description, created_at, updated_at
				FROM user_roles WHERE id = $1
			`, roleID).Scan(
				&role.ID, &role.Code, &role.Name, &role.Description,
				&role.CreatedAt, &role.UpdatedAt,
			)
			if err != nil {
				return fmt.Errorf("failed to load role information: %w", err)
			}
			u.Role = &role
		}
	}
	return nil
}
