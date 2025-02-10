package models

import (
	"time"

	"github.com/google/uuid"
)

// Task represents a task in the system
type Task struct {
	ID          uuid.UUID    `json:"id" db:"id"`
	Title       string       `json:"title" db:"title"`
	Status      StatusCode   `json:"status" db:"status"`
	Priority    PriorityCode `json:"priority" db:"priority"`
	Type        TypeCode     `json:"type" db:"type"`
	Content     TaskContent  `json:"content" db:"content"`
	Metadata    TaskMetadata `json:"metadata" db:"metadata"`
	Progress    TaskProgress `json:"progress" db:"progress"`
	CreatedBy   uuid.UUID    `json:"created_by" db:"created_by"`
	UpdatedBy   uuid.UUID    `json:"updated_by" db:"updated_by"`
}

// CreateTaskInput represents the input for creating a task
type CreateTaskInput struct {
	Title       string                `json:"title" validate:"required"`
	Status      StatusCode            `json:"status" validate:"required"`
	Priority    PriorityCode          `json:"priority" validate:"required"`
	Type        TypeCode              `json:"type" validate:"required"`
	Content     CreateTaskContentInput `json:"content" validate:"required"`
}

// UpdateTaskInput represents the input for updating a task
type UpdateTaskInput struct {
	Title       *string                `json:"title,omitempty"`
	Status      *StatusCode            `json:"status,omitempty"`
	Priority    *PriorityCode          `json:"priority,omitempty"`
	Type        *TypeCode              `json:"type,omitempty"`
	Content     *UpdateTaskContentInput `json:"content,omitempty"`
}

// NewTask creates a new task from input
func NewTask(input CreateTaskInput, createdBy uuid.UUID) *Task {
	now := time.Now().UTC()
	return &Task{
		ID:        uuid.New(),
		Title:     input.Title,
		Status:    input.Status,
		Priority:  input.Priority,
		Type:      input.Type,
		Content:   TaskContent{},  // Will be populated separately
		Metadata: TaskMetadata{
			CreatedAt: now,
			UpdatedAt: now,
		},
		Progress: TaskProgress{
			AcceptanceCriteria: struct {
				Total     int `json:"total"`
				Completed int `json:"completed"`
			}{
				Total:     0,
				Completed: 0,
			},
			Percentage: 0,
		},
		CreatedBy: createdBy,
		UpdatedBy: createdBy,
	}
}

// CanUserEdit checks if a user has edit permissions for the task
func (t *Task) CanUserEdit(userID uuid.UUID) bool {
	return t.CreatedBy == userID
}

// CanUserAdmin checks if a user has admin permissions for the task
func (t *Task) CanUserAdmin(userID uuid.UUID) bool {
	return t.CreatedBy == userID
}