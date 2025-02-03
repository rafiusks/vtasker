package repository

import (
	"context"
	"github.com/rafaelzasas/vtasker/internal/models"
)

func (r *TaskRepository) CreateAuditLog(ctx context.Context, log *models.AuditLog) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO audit_logs 
		(id, action, task_id, details, created_at)
		VALUES ($1, $2, $3, $4, $5)`,
		log.ID, log.Action, log.TaskID, log.Details, log.CreatedAt)
	return err
} 