package repository

import (
	"context"
	"fmt"

	"github.com/rafaelzasas/vtasker/internal/models"
)

func (r *TaskRepository) GetTaskWithStatus(ctx context.Context, taskID string) (*models.Task, error) {
	query := `
		SELECT t.id, t.title, t.description, t.status_id, 
			   t.priority_id, t.type, t.order, t.content,
			   t.relationships, t.metadata, t.progress,
			   t.created_at, t.updated_at,
			   ts.code, ts.name, ts.display_order
		FROM tasks t
		JOIN task_statuses ts ON t.status_id = ts.id
		WHERE t.id = $1`

	var task models.Task
	var status models.TaskStatusEntity
	
	err := r.pool.QueryRow(ctx, query, taskID).Scan(
		&task.ID, &task.Title, &task.Description, 
		&task.StatusID, &task.PriorityID, &task.Type,
		&task.Order, &task.Content, &task.Relationships,
		&task.Metadata, &task.Progress, &task.CreatedAt, &task.UpdatedAt,
		&status.Code, &status.Name, &status.DisplayOrder,
	)
	
	if err != nil {
		return nil, fmt.Errorf("error fetching task with status: %w", err)
	}
	
	task.Status = &models.TaskStatusEntity{
		ID:           status.ID,
		Code:         status.Code,
		Name:         status.Name,
		DisplayOrder: status.DisplayOrder,
	}
	return &task, nil
} 