package task

import (
	"time"
)

// Status represents a task status
type Status struct {
	ID           int32     `json:"id" db:"id"`
	Code         string    `json:"code" db:"code"`
	Name         string    `json:"name" db:"name"`
	Description  *string   `json:"description,omitempty" db:"description"`
	DisplayOrder int32     `json:"display_order" db:"display_order"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// Priority represents a task priority
type Priority struct {
	ID           int32  `json:"id" db:"id"`
	Name         string `json:"name" db:"name"`
	DisplayOrder int32  `json:"display_order" db:"display_order"`
}

// Type represents a task type
type Type struct {
	ID           int32     `json:"id" db:"id"`
	Code         string    `json:"code" db:"code"`
	Name         string    `json:"name" db:"name"`
	Description  *string   `json:"description,omitempty" db:"description"`
	DisplayOrder int32     `json:"display_order" db:"display_order"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// Metadata contains metadata about the task
type Metadata struct {
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Board     *string   `json:"board,omitempty" db:"board"`
	Column    *string   `json:"column,omitempty" db:"column"`
}

// Progress represents the completion metrics of a task
type Progress struct {
	AcceptanceCriteria struct {
		Total     int `json:"total"`
		Completed int `json:"completed"`
	} `json:"acceptance_criteria"`
	Percentage int `json:"percentage"`
}

// Relationships represents task relationships
type Relationships struct {
	Parent       *string   `json:"parent,omitempty" db:"parent"`
	Dependencies []string  `json:"dependencies" db:"dependencies"`
	Labels       []string  `json:"labels" db:"labels"`
}

// MoveRequest represents a request to move a task
type MoveRequest struct {
	StatusID         int32  `json:"status_id" validate:"required"`
	Order           int    `json:"order" validate:"required"`
	PreviousStatusID int32  `json:"previous_status_id"`
	Comment         string `json:"comment,omitempty"`
	Type            string `json:"type" validate:"required,oneof=feature bug chore"`
} 