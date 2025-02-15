package models

import (
	"time"

	"github.com/google/uuid"
)

// Project represents a project in the system
type Project struct {
	ID          uuid.UUID `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	CreatedBy   uuid.UUID `json:"created_by" db:"created_by"`
	IsArchived  bool      `json:"is_archived" db:"is_archived"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// CreateProjectRequest represents the request body for creating a project
type CreateProjectRequest struct {
	Name        string `json:"name" validate:"required,min=1,max=255"`
	Description string `json:"description" validate:"max=1000"`
}

// UpdateProjectRequest represents the request body for updating a project
type UpdateProjectRequest struct {
	Name        *string `json:"name" validate:"omitempty,min=1,max=255"`
	Description *string `json:"description" validate:"omitempty,max=1000"`
	IsArchived  *bool   `json:"is_archived"`
}

// ProjectResponse represents the response body for project operations
type ProjectResponse struct {
	Project
	IssueCount    int `json:"issue_count"`
	OpenIssueCount int `json:"open_issue_count"`
}

// ProjectListResponse represents the response body for listing projects
type ProjectListResponse struct {
	Projects []ProjectResponse `json:"projects"`
	Total    int64            `json:"total"`
	Page     int              `json:"page"`
	PageSize int              `json:"page_size"`
} 