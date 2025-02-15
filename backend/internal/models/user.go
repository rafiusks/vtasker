package models

import (
	"time"

	"github.com/google/uuid"
)

// User represents a user in the system
type User struct {
	ID           uuid.UUID `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	Name         string    `json:"name" db:"name"`
	PasswordHash string    `json:"-" db:"password_hash"`
	AvatarURL    *string   `json:"avatar_url,omitempty" db:"avatar_url"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// GetFullName returns the user's full name
func (u *User) GetFullName() string {
	return u.Name
}

// CreateUserRequest represents the request body for creating a user
type CreateUserRequest struct {
	Email    string  `json:"email" validate:"required,email,max=255"`
	Name     string  `json:"name" validate:"required,min=1,max=255"`
	Password string  `json:"password" validate:"required,min=8,max=72"`
	Avatar   *string `json:"avatar,omitempty" validate:"omitempty,url"`
}

// UpdateUserRequest represents the request body for updating a user
type UpdateUserRequest struct {
	Name     *string `json:"name,omitempty" validate:"omitempty,min=1,max=255"`
	Password *string `json:"password,omitempty" validate:"omitempty,min=8,max=72"`
	Avatar   *string `json:"avatar,omitempty" validate:"omitempty,url"`
}

// UserResponse represents the response body for user operations
type UserResponse struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	AvatarURL *string   `json:"avatar_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ToResponse converts a User to a UserResponse
func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:        u.ID,
		Email:     u.Email,
		Name:      u.Name,
		AvatarURL: u.AvatarURL,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
} 