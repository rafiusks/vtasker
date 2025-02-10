package models

import (
	"time"
)

// Status codes for tasks
type StatusCode string

const (
	StatusBacklog    StatusCode = "backlog"
	StatusTodo       StatusCode = "todo"
	StatusInProgress StatusCode = "in_progress"
	StatusBlocked    StatusCode = "blocked"
	StatusDone       StatusCode = "done"
)

// Priority codes for tasks
type PriorityCode string

const (
	PriorityLow    PriorityCode = "low"
	PriorityMedium PriorityCode = "medium"
	PriorityHigh   PriorityCode = "high"
	PriorityCritical PriorityCode = "critical"
)

// Type codes for tasks
type TypeCode string

const (
	TypeFeature TypeCode = "feature"
	TypeBug     TypeCode = "bug"
	TypeChore   TypeCode = "chore"
	TypeTask    TypeCode = "task"
)

// TaskStatus represents a task status
type TaskStatus struct {
	ID           int32     `json:"id" db:"id"`
	Code         string    `json:"code" db:"code"`
	Name         string    `json:"name" db:"name"`
	Description  *string   `json:"description,omitempty" db:"description"`
	DisplayOrder int32     `json:"display_order" db:"display_order"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// TaskPriority represents a task priority
type TaskPriority struct {
	ID           int32  `json:"id" db:"id"`
	Name         string `json:"name" db:"name"`
	DisplayOrder int32  `json:"display_order" db:"display_order"`
}

// TaskType represents a task type
type TaskType struct {
	ID           int32     `json:"id" db:"id"`
	Code         string    `json:"code" db:"code"`
	Name         string    `json:"name" db:"name"`
	Description  *string   `json:"description,omitempty" db:"description"`
	DisplayOrder int32     `json:"display_order" db:"display_order"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// TaskMetadata contains metadata about the task
type TaskMetadata struct {
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Board     *string   `json:"board,omitempty" db:"board"`
	Column    *string   `json:"column,omitempty" db:"column"`
}

// TaskProgress represents the completion metrics of a task
type TaskProgress struct {
	AcceptanceCriteria struct {
		Total     int `json:"total"`
		Completed int `json:"completed"`
	} `json:"acceptance_criteria"`
	Percentage int `json:"percentage"`
}

// TaskRelationships represents task relationships
type TaskRelationships struct {
	Parent       *string   `json:"parent,omitempty" db:"parent"`
	Dependencies []string  `json:"dependencies" db:"dependencies"`
	Labels       []string  `json:"labels" db:"labels"`
}

// TaskMoveRequest represents a request to move a task
type TaskMoveRequest struct {
	StatusID         int    `json:"status_id" validate:"required"`
	Order           int    `json:"order" validate:"required"`
	PreviousStatusID int    `json:"previous_status_id"`
	Comment         string `json:"comment,omitempty"`
	Type            string `json:"type" validate:"required,oneof=feature bug chore"`
} 