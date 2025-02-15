package models

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// Issue status constants
const (
	StatusTodo       = "todo"
	StatusInProgress = "in_progress"
	StatusInReview   = "in_review"
	StatusDone       = "done"
)

// Issue priority constants
const (
	PriorityLow    = "low"
	PriorityMedium = "medium"
	PriorityHigh   = "high"
)

// Common errors
var (
	ErrNotFound      = errors.New("resource not found")
	ErrInvalidUser   = errors.New("invalid user")
	ErrInvalidProject = errors.New("invalid project")
)

// Issue represents an issue in the system
type Issue struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	Title       string     `json:"title" db:"title"`
	Description string     `json:"description" db:"description"`
	Status      string     `json:"status" db:"status"`
	Priority    string     `json:"priority" db:"priority"`
	ProjectID   uuid.UUID  `json:"project_id" db:"project_id"`
	AssigneeID  *uuid.UUID `json:"assignee_id,omitempty" db:"assignee_id"`
	CreatedBy   uuid.UUID  `json:"created_by" db:"created_by"`
	IsArchived  bool       `json:"is_archived" db:"is_archived"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

// CreateIssueRequest represents the request body for creating an issue
type CreateIssueRequest struct {
	Title       string     `json:"title" validate:"required,min=1,max=255"`
	Description string     `json:"description" validate:"max=10000"`
	Priority    string     `json:"priority" validate:"required,oneof=low medium high"`
	ProjectID   uuid.UUID  `json:"project_id" validate:"required"`
	AssigneeID  *uuid.UUID `json:"assignee_id,omitempty"`
}

// UpdateIssueRequest represents the request body for updating an issue
type UpdateIssueRequest struct {
	Title       *string     `json:"title,omitempty" validate:"omitempty,min=1,max=255"`
	Description *string     `json:"description,omitempty" validate:"omitempty,max=10000"`
	Status      *string     `json:"status,omitempty" validate:"omitempty,oneof=todo in_progress in_review done"`
	Priority    *string     `json:"priority,omitempty" validate:"omitempty,oneof=low medium high"`
	AssigneeID  *uuid.UUID  `json:"assignee_id,omitempty"`
}

// IssueResponse represents the response body for issue operations
type IssueResponse struct {
	Issue
	ProjectName  string `json:"project_name"`
	AssigneeName string `json:"assignee_name,omitempty"`
}

// IssueListResponse represents the response body for listing issues
type IssueListResponse struct {
	Items      []IssueResponse `json:"items"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"page_size"`
	TotalPages int64          `json:"total_pages"`
}

// IssueFilter represents the filter options for listing issues
type IssueFilter struct {
	ProjectID  *uuid.UUID `json:"project_id,omitempty"`
	Status     *string    `json:"status,omitempty"`
	Priority   *string    `json:"priority,omitempty"`
	AssigneeID *uuid.UUID `json:"assignee_id,omitempty"`
	Search     *string    `json:"search,omitempty"`
}