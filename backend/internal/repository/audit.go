package repository

import (
	"context"

	"github.com/rafaelzasas/vtasker/backend/internal/models"
)

// CreateAuditLog creates a new audit log entry
func (r *TaskRepository) CreateAuditLog(ctx context.Context, entry *models.AuditLog) error {
	query := `
		INSERT INTO audit_logs (
			action,
			task_id,
			details,
			created_at
		) VALUES ($1, $2, $3, $4)`

	_, err := r.db.Exec(ctx, query,
		entry.Action,
		entry.TaskID,
		entry.Details,
		entry.CreatedAt,
	)
	if err != nil {
		return err
	}

	return nil
} 