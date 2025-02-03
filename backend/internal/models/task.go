package models

import (
	"time"
)

// TaskStatusCode represents the status code type
type TaskStatusCode string

const (
	StatusBacklog    TaskStatusCode = "backlog"
	StatusInProgress TaskStatusCode = "in-progress"
	StatusReview     TaskStatusCode = "review"
	StatusDone       TaskStatusCode = "done"
)

type TaskPriority string
type TaskType string

const (
	PriorityLow    TaskPriority = "low"
	PriorityNormal TaskPriority = "normal"
	PriorityHigh   TaskPriority = "high"

	TypeFeature TaskType = "feature"
	TypeBug     TaskType = "bug"
	TypeDocs    TaskType = "docs"
	TypeChore   TaskType = "chore"
)

// TaskMetadata contains metadata about the task
type TaskMetadata struct {
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Board     *string   `json:"board,omitempty"`
	Column    *string   `json:"column,omitempty"`
}

// TaskProgress represents the completion metrics of a task
type TaskProgress struct {
	AcceptanceCriteria struct {
		Total     int `json:"total"`
		Completed int `json:"completed"`
	} `json:"acceptance_criteria"`
	Percentage int `json:"percentage"`
}

// TaskContent contains the detailed content of a task
type TaskContent struct {
	Description          string               `json:"description"`
	AcceptanceCriteria   []AcceptanceCriterion `json:"acceptance_criteria"`
	ImplementationDetails *string              `json:"implementation_details,omitempty"`
	Notes                *string              `json:"notes,omitempty"`
	Attachments          []string            `json:"attachments,omitempty"`
	DueDate              *time.Time          `json:"due_date,omitempty"`
	Assignee             *string             `json:"assignee,omitempty"`
}

// AcceptanceCriterion represents a single acceptance criterion
type AcceptanceCriterion struct {
	ID          string     `json:"id"`
	Description string     `json:"description"`
	Completed   bool       `json:"completed"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	CompletedBy *string    `json:"completed_by,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Order       int        `json:"order"`
	Category    *string    `json:"category,omitempty"`
	Notes       *string    `json:"notes,omitempty"`
}

// TaskStatus represents a task status in the database
type TaskStatusEntity struct {
	ID           int           `json:"id"`
	Code         TaskStatusCode `json:"code"`
	Name         string        `json:"name"`
	Description  *string       `json:"description,omitempty"`
	DisplayOrder int           `json:"display_order"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
}

// TaskRelationships represents task relationships
type TaskRelationships struct {
	Parent       *string   `json:"parent,omitempty"`
	Dependencies []string  `json:"dependencies,omitempty"`
	Labels       []string  `json:"labels,omitempty"`
}

// TaskPriorityEntity represents a task priority in the database
type TaskPriorityEntity struct {
	ID           int       `json:"id"`
	Code         string    `json:"code"`
	Name         string    `json:"name"`
	Description  *string   `json:"description,omitempty"`
	DisplayOrder int       `json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Task represents a task in the system
type Task struct {
	ID            string            `json:"id"`
	Title         string            `json:"title"`
	Description   string            `json:"description"`
	StatusID      int               `json:"status_id" db:"status_id"`
	Status        *TaskStatusEntity `json:"status,omitempty"`
	PriorityID    int               `json:"priority_id" db:"priority_id"`
	Priority      *TaskPriorityEntity `json:"priority,omitempty"`
	Type          string            `json:"type" db:"type"`
	Order         int               `json:"order" db:"order"`
	Content       *TaskContent      `json:"content" db:"content"`
	Relationships TaskRelationships `json:"relationships" db:"relationships"`
	Metadata      TaskMetadata     `json:"metadata" db:"metadata"`
	Progress      TaskProgress     `json:"progress" db:"progress"`
	StatusHistory []StatusChange   `json:"status_history,omitempty" db:"status_history"`
	CreatedAt     time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time        `json:"updated_at" db:"updated_at"`
}

// StatusChange represents a change in task status
type StatusChange struct {
	TaskID      string           `json:"task_id" db:"task_id"`
	FromStatusID int             `json:"from_status_id" db:"from_status_id"`
	ToStatusID   int             `json:"to_status_id" db:"to_status_id"`
	FromStatus  *TaskStatusEntity `json:"from_status,omitempty"`
	ToStatus    *TaskStatusEntity `json:"to_status,omitempty"`
	From        TaskStatusCode    `json:"from" db:"from"`
	To          TaskStatusCode    `json:"to" db:"to"`
	Comment     *string          `json:"comment,omitempty" db:"comment"`
	Timestamp   time.Time        `json:"timestamp" db:"timestamp"`
	ChangedAt   time.Time        `json:"changed_at" db:"changed_at"`
}

type TaskStatus struct {
	ID           int    `json:"id"`
	Code         string `json:"code"`
	Name         string `json:"name"`
	DisplayOrder int    `json:"display_order"`
} 