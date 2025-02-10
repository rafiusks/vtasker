// Package user provides the user model and related functionality
package user

import (
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// UserRole represents the role of a user in the system
type UserRole string

const (
	// UserRoleAdmin represents an administrator user
	UserRoleAdmin UserRole = "admin"
	// UserRoleUser represents a regular user
	UserRoleUser UserRole = "user"
)

// User represents a user in the system
type User struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	Email       string     `json:"email" db:"email"`
	Username    string     `json:"username" db:"username"`
	PasswordHash string    `json:"-" db:"password_hash"`
	FullName    string     `json:"full_name,omitempty" db:"full_name"`
	AvatarURL   string     `json:"avatar_url,omitempty" db:"avatar_url"`
	Role        UserRole   `json:"role" db:"role"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
	LastLoginAt *time.Time `json:"last_login_at,omitempty" db:"last_login_at"`
}

// CreateInput represents the input for creating a new user
type CreateInput struct {
	Email     string   `json:"email" validate:"required,email"`
	Username  string   `json:"username" validate:"required,min=3,max=50"`
	Password  string   `json:"password" validate:"required,min=8"`
	FullName  string   `json:"full_name,omitempty"`
	AvatarURL string   `json:"avatar_url,omitempty"`
	Role      UserRole `json:"role,omitempty"`
}

// UpdateInput represents the input for updating a user
type UpdateInput struct {
	Email     *string   `json:"email,omitempty" validate:"omitempty,email"`
	Username  *string   `json:"username,omitempty" validate:"omitempty,min=3,max=50"`
	Password  *string   `json:"password,omitempty" validate:"omitempty,min=8"`
	FullName  *string   `json:"full_name,omitempty"`
	AvatarURL *string   `json:"avatar_url,omitempty"`
	Role      *UserRole `json:"role,omitempty"`
}

// LoginInput represents the input for user login
type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// New creates a new user from input
func New(input CreateInput) (*User, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Set default role if not provided
	if input.Role == "" {
		input.Role = UserRoleUser
	}

	now := time.Now().UTC()
	return &User{
		ID:           uuid.New(),
		Email:        input.Email,
		Username:     input.Username,
		PasswordHash: string(hashedPassword),
		FullName:     input.FullName,
		AvatarURL:    input.AvatarURL,
		Role:         input.Role,
		CreatedAt:    now,
		UpdatedAt:    now,
	}, nil
}

// ValidatePassword checks if the provided password matches the user's password hash
func (u *User) ValidatePassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}

// UpdatePassword updates the user's password
func (u *User) UpdatePassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hashedPassword)
	return nil
}

// ToPublicUser returns a public view of the user without sensitive information
func (u *User) ToPublicUser() map[string]interface{} {
	return map[string]interface{}{
		"id":         u.ID,
		"email":      u.Email,
		"username":   u.Username,
		"full_name":  u.FullName,
		"avatar_url": u.AvatarURL,
		"role":       u.Role,
		"created_at": u.CreatedAt,
	}
}

// IsAdmin checks if the user has admin role
func (u *User) IsAdmin() bool {
	return u.Role == UserRoleAdmin
} 