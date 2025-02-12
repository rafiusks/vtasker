// Package user provides the user model and related functionality
package user

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// UserRole represents a role in the system
type UserRole struct {
	ID          int       `json:"id" db:"id"`
	Code        string    `json:"code" db:"code"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// Role codes
const (
	RoleCodeSuperAdmin = "super_admin"
	RoleCodeAdmin     = "admin"
	RoleCodeUser      = "user"
)

// User represents a user in the system
type User struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	Email        string     `json:"email" db:"email"`
	PasswordHash string     `json:"-" db:"password_hash"`
	FullName     string     `json:"full_name" db:"full_name"`
	AvatarURL    string     `json:"avatar_url,omitempty" db:"avatar_url"`
	RoleID       int        `json:"-" db:"role_id"`
	Role         *UserRole  `json:"role" db:"-"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
	LastLoginAt  *time.Time `json:"last_login_at,omitempty" db:"last_login_at"`
}

// MarshalJSON implements the json.Marshaler interface
func (u *User) MarshalJSON() ([]byte, error) {
	type Alias User
	return json.Marshal(&struct {
		*Alias
		Role string `json:"role_code"`
	}{
		Alias: (*Alias)(u),
		Role:  u.GetRole(),
	})
}

// GetRole returns the user's role code, defaulting to "user" if Role is nil
func (u *User) GetRole() string {
	if u.Role == nil {
		return RoleCodeUser
	}
	return u.Role.Code
}

// CreateInput represents the input for creating a new user
type CreateInput struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8"`
	FullName  string `json:"full_name" validate:"required"`
	AvatarURL string `json:"avatar_url,omitempty"`
	RoleID    *int   `json:"role_id,omitempty"`
}

// UpdateInput represents the input for updating a user
type UpdateInput struct {
	Email     *string `json:"email,omitempty" validate:"omitempty,email"`
	Password  *string `json:"password,omitempty" validate:"omitempty,min=8"`
	FullName  *string `json:"full_name,omitempty"`
	AvatarURL *string `json:"avatar_url,omitempty"`
	RoleID    *int    `json:"role_id,omitempty"`
}

// LoginInput represents the input for user login
type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// New creates a new user from input
func New(input CreateInput, defaultRoleID int) (*User, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	roleID := defaultRoleID
	if input.RoleID != nil {
		roleID = *input.RoleID
	}

	now := time.Now().UTC()
	return &User{
		ID:           uuid.New(),
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		FullName:     input.FullName,
		AvatarURL:    input.AvatarURL,
		RoleID:       roleID,
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
		"full_name":  u.FullName,
		"avatar_url": u.AvatarURL,
		"role":       u.Role,
		"created_at": u.CreatedAt,
	}
}

// IsAdmin checks if the user has admin role
func (u *User) IsAdmin() bool {
	return u.Role != nil && (u.Role.Code == RoleCodeAdmin || u.Role.Code == RoleCodeSuperAdmin)
}

// IsSuperAdmin checks if the user has super admin role
func (u *User) IsSuperAdmin() bool {
	return u.Role != nil && u.Role.Code == RoleCodeSuperAdmin
} 