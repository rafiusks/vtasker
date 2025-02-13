package models

import (
	"time"

	"github.com/google/uuid"
)

// Task represents a task in the system
type Task struct {
	ID          uuid.UUID    `json:"id" db:"id"`
	Title       string       `json:"title" db:"title"`
	Description string       `json:"description" db:"description"`
	StatusID    int32        `json:"status_id" db:"status_id"`
	PriorityID  int32        `json:"priority_id" db:"priority_id"`
	TypeID      int32        `json:"type_id" db:"type_id"`
	OwnerID     *uuid.UUID   `json:"owner_id,omitempty" db:"owner_id"`
	ParentID    *uuid.UUID   `json:"parent_id,omitempty" db:"parent_id"`
	BoardID     *uuid.UUID   `json:"board_id,omitempty" db:"board_id"`
	OrderIndex  int32        `json:"order_index" db:"order_index"`
	Content     TaskContent  `json:"content"`
	CreatedAt   time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at" db:"updated_at"`
}

// CreateTaskInput represents the input for creating a task
type CreateTaskInput struct {
	Title       string                `json:"title" validate:"required"`
	Description string                `json:"description"`
	StatusID    int32                 `json:"status_id" validate:"required"`
	PriorityID  int32                 `json:"priority_id" validate:"required"`
	TypeID      int32                 `json:"type_id" validate:"required"`
	BoardID     *uuid.UUID            `json:"board_id,omitempty"`
	Content     CreateTaskContentInput `json:"content" validate:"required"`
}

// UpdateTaskInput represents the input for updating a task
type UpdateTaskInput struct {
	Title       *string                 `json:"title,omitempty"`
	Description *string                 `json:"description,omitempty"`
	StatusID    *int32                  `json:"status_id,omitempty"`
	PriorityID  *int32                  `json:"priority_id,omitempty"`
	TypeID      *int32                  `json:"type_id,omitempty"`
	BoardID     *uuid.UUID              `json:"board_id,omitempty"`
	Order       *int                    `json:"order,omitempty"`
	Content     *UpdateTaskContentInput `json:"content,omitempty"`
}

// TaskMoveInput represents the input for moving a task
type TaskMoveInput struct {
	StatusID int32  `json:"status_id" binding:"required"`
	Order    int32  `json:"order" binding:"required"`
	Comment  string `json:"comment,omitempty"`
	Type     string `json:"type,omitempty"`
}

// NewTask creates a new task from input
func NewTask(input CreateTaskInput, ownerID uuid.UUID) *Task {
	now := time.Now().UTC()
	return &Task{
		ID:          uuid.New(),
		Title:       input.Title,
		Description: input.Description,
		StatusID:    input.StatusID,
		PriorityID:  input.PriorityID,
		TypeID:      input.TypeID,
		OwnerID:     &ownerID,
		BoardID:     input.BoardID,
		Content:     TaskContent{},  // Will be populated separately
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// CanUserEdit checks if a user has edit permissions for the task
func (t *Task) CanUserEdit(userID uuid.UUID) bool {
	return t.OwnerID != nil && *t.OwnerID == userID
}

// CanUserAdmin checks if a user has admin permissions for the task
func (t *Task) CanUserAdmin(userID uuid.UUID) bool {
	return t.OwnerID != nil && *t.OwnerID == userID
}