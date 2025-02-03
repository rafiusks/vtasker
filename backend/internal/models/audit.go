package models

import "time"

type AuditLog struct {
	ID        string    `json:"id"`
	Action    string    `json:"action"`
	TaskID    string    `json:"task_id"`
	Details   string    `json:"details"`
	CreatedAt time.Time `json:"created_at"`
} 