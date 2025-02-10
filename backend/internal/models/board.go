package models

import (
	"time"

	"github.com/google/uuid"
)

type BoardType string
type BoardStatus string
type BoardMemberRole string

const (
	BoardTypePersonal BoardType = "personal"
	BoardTypeTeam    BoardType = "team"
	BoardTypeProject BoardType = "project"

	BoardStatusActive   BoardStatus = "active"
	BoardStatusArchived BoardStatus = "archived"

	BoardMemberRoleViewer BoardMemberRole = "viewer"
	BoardMemberRoleEditor BoardMemberRole = "editor"
	BoardMemberRoleAdmin  BoardMemberRole = "admin"
)

// Board represents a board in the system
type Board struct {
	ID          uuid.UUID   `json:"id" db:"id"`
	Name        string      `json:"name" db:"name"`
	Description string      `json:"description" db:"description"`
	OwnerID     uuid.UUID   `json:"owner_id" db:"owner_id"`
	Type        BoardType   `json:"type" db:"type"`
	Status      BoardStatus `json:"status" db:"status"`
	CreatedAt   time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at" db:"updated_at"`
	Columns     []BoardColumn `json:"columns,omitempty" db:"-"`
	Members     []BoardMember `json:"members,omitempty" db:"-"`
}

// BoardColumn represents a column in a board
type BoardColumn struct {
	ID          uuid.UUID `json:"id" db:"id"`
	BoardID     uuid.UUID `json:"board_id" db:"board_id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	TaskLimit   *int      `json:"task_limit,omitempty" db:"task_limit"`
	OrderIndex  int       `json:"order_index" db:"order_index"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// BoardMember represents a member of a board
type BoardMember struct {
	BoardID   uuid.UUID       `json:"board_id" db:"board_id"`
	UserID    uuid.UUID       `json:"user_id" db:"user_id"`
	Role      BoardMemberRole `json:"role" db:"role"`
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
	User      *User           `json:"user,omitempty" db:"-"`
}

// CreateBoardInput represents the input for creating a new board
type CreateBoardInput struct {
	Name        string    `json:"name" validate:"required,min=1,max=100"`
	Description string    `json:"description"`
	Type        BoardType `json:"type" validate:"required,oneof=personal team project"`
	Columns     []CreateBoardColumnInput `json:"columns"`
}

// CreateBoardColumnInput represents the input for creating a new board column
type CreateBoardColumnInput struct {
	Name        string `json:"name" validate:"required,min=1,max=100"`
	Description string `json:"description"`
	TaskLimit   *int   `json:"task_limit,omitempty"`
	OrderIndex  int    `json:"order_index"`
}

// UpdateBoardInput represents the input for updating a board
type UpdateBoardInput struct {
	Name        *string      `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
	Description *string      `json:"description,omitempty"`
	Type        *BoardType   `json:"type,omitempty" validate:"omitempty,oneof=personal team project"`
	Status      *BoardStatus `json:"status,omitempty" validate:"omitempty,oneof=active archived"`
}

// NewBoard creates a new board from input
func NewBoard(input CreateBoardInput, ownerID uuid.UUID) *Board {
	now := time.Now().UTC()
	return &Board{
		ID:          uuid.New(),
		Name:        input.Name,
		Description: input.Description,
		OwnerID:     ownerID,
		Type:        input.Type,
		Status:      BoardStatusActive,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// NewBoardColumn creates a new board column
func NewBoardColumn(boardID uuid.UUID, input CreateBoardColumnInput) *BoardColumn {
	now := time.Now().UTC()
	return &BoardColumn{
		ID:          uuid.New(),
		BoardID:     boardID,
		Name:        input.Name,
		Description: input.Description,
		TaskLimit:   input.TaskLimit,
		OrderIndex:  input.OrderIndex,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// AddMember adds a member to the board
func (b *Board) AddMember(userID uuid.UUID, role BoardMemberRole) *BoardMember {
	return &BoardMember{
		BoardID:   b.ID,
		UserID:    userID,
		Role:      role,
		CreatedAt: time.Now().UTC(),
	}
}

// CanUserEdit checks if a user has edit permissions for the board
func (b *Board) CanUserEdit(userID uuid.UUID) bool {
	if b.OwnerID == userID {
		return true
	}

	for _, member := range b.Members {
		if member.UserID == userID {
			return member.Role == BoardMemberRoleEditor || member.Role == BoardMemberRoleAdmin
		}
	}

	return false
}

// CanUserAdmin checks if a user has admin permissions for the board
func (b *Board) CanUserAdmin(userID uuid.UUID) bool {
	if b.OwnerID == userID {
		return true
	}

	for _, member := range b.Members {
		if member.UserID == userID {
			return member.Role == BoardMemberRoleAdmin
		}
	}

	return false
} 