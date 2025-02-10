// Package task provides the core task model and related functionality
package task

import (
	"time"

	"github.com/google/uuid"
	"github.com/rafaelzasas/vtasker/backend/internal/models/content"
	"github.com/rafaelzasas/vtasker/backend/internal/models/types"
)

type CollaboratorRole string

const (
	CollaboratorRoleViewer CollaboratorRole = "viewer"
	CollaboratorRoleEditor CollaboratorRole = "editor"
	CollaboratorRoleAdmin  CollaboratorRole = "admin"
)

// Task represents a task in the system
type Task struct {
	ID          uuid.UUID `json:"id" db:"id"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	StatusID    int32     `json:"status_id" db:"status_id"`
	PriorityID  int32     `json:"priority_id" db:"priority_id"`
	TypeID      int32     `json:"type_id" db:"type_id"`
	Order       int       `json:"order" db:"order"`
	OwnerID     uuid.UUID `json:"owner_id" db:"owner_id"`
	BoardID     *uuid.UUID `json:"board_id,omitempty" db:"board_id"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`

	// Relationships loaded from other tables
	Owner         interface{}    `json:"owner,omitempty" db:"-"`
	Collaborators []Collaborator `json:"collaborators,omitempty" db:"-"`
	Content       *content.Content `json:"content,omitempty" db:"-"`
	Status        *types.Status   `json:"status,omitempty" db:"-"`
	Priority      *types.Priority `json:"priority,omitempty" db:"-"`
	Type          *types.Type     `json:"type,omitempty" db:"-"`
}

// Collaborator represents a collaborator on a task
type Collaborator struct {
	TaskID    uuid.UUID       `json:"task_id" db:"task_id"`
	UserID    uuid.UUID       `json:"user_id" db:"user_id"`
	Role      CollaboratorRole `json:"role" db:"role"`
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
	User      interface{}     `json:"user,omitempty" db:"-"`
}

// CreateInput represents the input for creating a new task
type CreateInput struct {
	Title       string     `json:"title" validate:"required,min=1,max=100"`
	Description string     `json:"description" validate:"required"`
	StatusID    int32      `json:"status_id" validate:"required"`
	PriorityID  int32      `json:"priority_id" validate:"required"`
	TypeID      int32      `json:"type_id" validate:"required"`
	Order       int        `json:"order"`
	BoardID     *uuid.UUID `json:"board_id,omitempty"`
	Content     *content.CreateInput `json:"content,omitempty"`
}

// UpdateInput represents the input for updating a task
type UpdateInput struct {
	Title       *string    `json:"title,omitempty" validate:"omitempty,min=1,max=100"`
	Description *string    `json:"description,omitempty"`
	StatusID    *int32     `json:"status_id,omitempty"`
	PriorityID  *int32     `json:"priority_id,omitempty"`
	TypeID      *int32     `json:"type_id,omitempty"`
	Order       *int       `json:"order,omitempty"`
	BoardID     *uuid.UUID `json:"board_id,omitempty"`
	Content     *content.UpdateInput `json:"content,omitempty"`
}

// New creates a new task from input
func New(input CreateInput, ownerID uuid.UUID) *Task {
	now := time.Now().UTC()
	return &Task{
		ID:          uuid.New(),
		Title:       input.Title,
		Description: input.Description,
		StatusID:    input.StatusID,
		PriorityID:  input.PriorityID,
		TypeID:      input.TypeID,
		Order:       input.Order,
		OwnerID:     ownerID,
		BoardID:     input.BoardID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// AddCollaborator adds a collaborator to the task
func (t *Task) AddCollaborator(userID uuid.UUID, role CollaboratorRole) *Collaborator {
	return &Collaborator{
		TaskID:    t.ID,
		UserID:    userID,
		Role:      role,
		CreatedAt: time.Now().UTC(),
	}
}

// CanUserEdit checks if a user has edit permissions for the task
func (t *Task) CanUserEdit(userID uuid.UUID) bool {
	if t.OwnerID == userID {
		return true
	}

	for _, collab := range t.Collaborators {
		if collab.UserID == userID {
			return collab.Role == CollaboratorRoleEditor || collab.Role == CollaboratorRoleAdmin
		}
	}

	return false
}

// CanUserAdmin checks if a user has admin permissions for the task
func (t *Task) CanUserAdmin(userID uuid.UUID) bool {
	if t.OwnerID == userID {
		return true
	}

	for _, collab := range t.Collaborators {
		if collab.UserID == userID {
			return collab.Role == CollaboratorRoleAdmin
		}
	}

	return false
}