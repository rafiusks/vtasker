package task

import (
	"time"

	"github.com/google/uuid"
)

// Content represents the content of a task
type Content struct {
	Description          string               `json:"description" db:"description"`
	AcceptanceCriteria  []AcceptanceCriterion `json:"acceptance_criteria" db:"acceptance_criteria"`
	ImplementationDetails string              `json:"implementation_details,omitempty" db:"implementation_details"`
	Notes               string               `json:"notes,omitempty" db:"notes"`
	Attachments         []string             `json:"attachments" db:"attachments"`
	DueDate             *time.Time           `json:"due_date,omitempty" db:"due_date"`
	Assignee            *uuid.UUID           `json:"assignee,omitempty" db:"assignee"`
}

// AcceptanceCriterion represents an acceptance criterion for a task
type AcceptanceCriterion struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	Description string     `json:"description" db:"description"`
	Completed   bool       `json:"completed" db:"completed"`
	CompletedAt *time.Time `json:"completed_at,omitempty" db:"completed_at"`
	CompletedBy *uuid.UUID `json:"completed_by,omitempty" db:"completed_by"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
	Order       int        `json:"order" db:"order"`
	Category    *string    `json:"category,omitempty" db:"category"`
	Notes       *string    `json:"notes,omitempty" db:"notes"`
}

// CreateContentInput represents the input for creating task content
type CreateContentInput struct {
	Description          string                      `json:"description" validate:"required"`
	AcceptanceCriteria  []CreateAcceptanceCriterionInput  `json:"acceptance_criteria,omitempty"`
	ImplementationDetails string                     `json:"implementation_details,omitempty"`
	Notes               string                      `json:"notes,omitempty"`
	Attachments         []string                    `json:"attachments,omitempty"`
	DueDate             *time.Time                  `json:"due_date,omitempty"`
	Assignee            *uuid.UUID                  `json:"assignee,omitempty"`
}

// UpdateContentInput represents the input for updating task content
type UpdateContentInput struct {
	Description          *string                      `json:"description,omitempty"`
	AcceptanceCriteria  []UpdateAcceptanceCriterionInput  `json:"acceptance_criteria,omitempty"`
	ImplementationDetails *string                     `json:"implementation_details,omitempty"`
	Notes               *string                      `json:"notes,omitempty"`
	Attachments         []string                    `json:"attachments,omitempty"`
	DueDate             *time.Time                  `json:"due_date,omitempty"`
	Assignee            *uuid.UUID                  `json:"assignee,omitempty"`
}

// CreateAcceptanceCriterionInput represents the input for creating an acceptance criterion
type CreateAcceptanceCriterionInput struct {
	Description string  `json:"description" validate:"required"`
	Category    string  `json:"category,omitempty"`
	Notes       string  `json:"notes,omitempty"`
	Order       int     `json:"order"`
}

// UpdateAcceptanceCriterionInput represents the input for updating an acceptance criterion
type UpdateAcceptanceCriterionInput struct {
	ID          uuid.UUID `json:"id" validate:"required"`
	Description *string   `json:"description,omitempty"`
	Category    *string   `json:"category,omitempty"`
	Notes       *string   `json:"notes,omitempty"`
	Order       *int      `json:"order,omitempty"`
}

// NewAcceptanceCriterion creates a new acceptance criterion from input
func NewAcceptanceCriterion(input CreateAcceptanceCriterionInput) *AcceptanceCriterion {
	now := time.Now().UTC()
	var category, notes *string
	if input.Category != "" {
		category = &input.Category
	}
	if input.Notes != "" {
		notes = &input.Notes
	}
	return &AcceptanceCriterion{
		ID:          uuid.New(),
		Description: input.Description,
		Completed:   false,
		CreatedAt:   now,
		UpdatedAt:   now,
		Order:       input.Order,
		Category:    category,
		Notes:       notes,
	}
} 