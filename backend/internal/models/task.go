package models

import (
	"time"
)

type TaskStatus string
type TaskPriority string
type TaskType string

const (
	StatusBacklog    TaskStatus = "backlog"
	StatusInProgress TaskStatus = "in-progress"
	StatusReview     TaskStatus = "review"
	StatusDone       TaskStatus = "done"

	PriorityLow    TaskPriority = "low"
	PriorityNormal TaskPriority = "normal"
	PriorityHigh   TaskPriority = "high"

	TypeFeature TaskType = "feature"
	TypeBug     TaskType = "bug"
	TypeDocs    TaskType = "docs"
	TypeChore   TaskType = "chore"
)

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

type TaskContent struct {
	Description          string               `json:"description"`
	AcceptanceCriteria   []AcceptanceCriterion `json:"acceptance_criteria"`
	ImplementationDetails *string              `json:"implementation_details,omitempty"`
	Notes                *string              `json:"notes,omitempty"`
	Attachments          []string            `json:"attachments,omitempty"`
	DueDate              *time.Time          `json:"due_date,omitempty"`
	Assignee             *string             `json:"assignee,omitempty"`
}

type Task struct {
	ID            string       `json:"id"`
	ExternalID    string       `json:"external_id"`
	Title         string       `json:"title"`
	Description   string       `json:"description"`
	Status        TaskStatus   `json:"status"`
	Priority      TaskPriority `json:"priority"`
	Type          TaskType     `json:"type"`
	Labels        []string     `json:"labels,omitempty"`
	Dependencies  []string     `json:"dependencies,omitempty"`
	Content       *TaskContent `json:"content"`
	Parent        *string      `json:"parent,omitempty"`
	Board         *string      `json:"board,omitempty"`
	Column        *string      `json:"column,omitempty"`
	Order         int          `json:"order"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
	StatusHistory []StatusChange `json:"status_history,omitempty"`
}

type StatusChange struct {
	From      TaskStatus `json:"from"`
	To        TaskStatus `json:"to"`
	Timestamp time.Time  `json:"timestamp"`
	Comment   *string    `json:"comment,omitempty"`
} 