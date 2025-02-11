package models

import (
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
)

// BoardRole represents a user's role in a board
type BoardRole string

const (
	BoardRoleViewer BoardRole = "viewer"
	BoardRoleEditor BoardRole = "editor"
	BoardRoleAdmin  BoardRole = "admin"
)

// Board represents a project or workspace that contains tasks
type Board struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	Name        string     `json:"name" db:"name"`
	Slug        string     `json:"slug" db:"slug"`
	Description string     `json:"description,omitempty" db:"description"`
	OwnerID     *uuid.UUID `json:"owner_id,omitempty" db:"owner_id"`
	IsPublic    bool       `json:"is_public" db:"is_public"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
	Members     []BoardMember `json:"members,omitempty"`
	Tasks       []Task       `json:"tasks,omitempty"`
}

// BoardMember represents a user's membership in a board
type BoardMember struct {
	BoardID   uuid.UUID `json:"board_id" db:"board_id"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	Role      BoardRole `json:"role" db:"role"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	User      *User     `json:"user,omitempty"`
}

// CreateBoardInput represents the input for creating a new board
type CreateBoardInput struct {
	Name        string    `json:"name" validate:"required"`
	Description string    `json:"description"`
	IsPublic    bool      `json:"is_public"`
	Members     []BoardMemberInput `json:"members,omitempty"`
}

// UpdateBoardInput represents the input for updating a board
type UpdateBoardInput struct {
	Name        *string    `json:"name,omitempty"`
	Description *string    `json:"description,omitempty"`
	IsPublic    *bool      `json:"is_public,omitempty"`
	Members     []BoardMemberInput `json:"members,omitempty"`
}

// BoardMemberInput represents the input for adding/updating a board member
type BoardMemberInput struct {
	UserID uuid.UUID `json:"user_id" validate:"required"`
	Role   BoardRole `json:"role" validate:"required,oneof=viewer editor admin"`
}

// NewBoard creates a new board from input
func NewBoard(input CreateBoardInput, ownerID uuid.UUID) *Board {
	now := time.Now().UTC()
	return &Board{
		ID:          uuid.New(),
		Name:        input.Name,
		Slug:        GenerateSlug(input.Name),
		Description: input.Description,
		OwnerID:     &ownerID,
		IsPublic:    input.IsPublic,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// GenerateSlug creates a URL-friendly slug from a string
func GenerateSlug(s string) string {
	// Convert to lowercase
	s = strings.ToLower(s)

	// Replace non-alphanumeric characters with hyphens
	reg := regexp.MustCompile("[^a-z0-9]+")
	s = reg.ReplaceAllString(s, "-")

	// Remove leading/trailing hyphens
	s = strings.Trim(s, "-")

	// Ensure unique by appending timestamp if needed
	// This will be handled at the repository level
	return s
}

// CanUserEdit checks if a user has edit permissions for the board
func (b *Board) CanUserEdit(userID uuid.UUID) bool {
	// Owner has full permissions
	if b.OwnerID != nil && *b.OwnerID == userID {
		return true
	}

	// Check member permissions
	for _, member := range b.Members {
		if member.UserID == userID {
			return member.Role == BoardRoleEditor || member.Role == BoardRoleAdmin
		}
	}

	return false
}

// CanUserAdmin checks if a user has admin permissions for the board
func (b *Board) CanUserAdmin(userID uuid.UUID) bool {
	// Owner has full permissions
	if b.OwnerID != nil && *b.OwnerID == userID {
		return true
	}

	// Check member permissions
	for _, member := range b.Members {
		if member.UserID == userID {
			return member.Role == BoardRoleAdmin
		}
	}

	return false
}

// CanUserView checks if a user can view the board
func (b *Board) CanUserView(userID uuid.UUID) bool {
	// Public boards can be viewed by anyone
	if b.IsPublic {
		return true
	}

	// Owner has full permissions
	if b.OwnerID != nil && *b.OwnerID == userID {
		return true
	}

	// Check member permissions
	for _, member := range b.Members {
		if member.UserID == userID {
			return true
		}
	}

	return false
} 