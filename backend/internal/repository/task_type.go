package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/backend/internal/models"
)

// TaskTypeRepository handles database operations for task types
type TaskTypeRepository struct {
	pool *pgxpool.Pool
}

// NewTaskTypeRepository creates a new TaskTypeRepository instance
func NewTaskTypeRepository(pool *pgxpool.Pool) *TaskTypeRepository {
	return &TaskTypeRepository{pool: pool}
}

// GetDefaultTaskType retrieves the default task type
func (r *TaskTypeRepository) GetDefaultTaskType(ctx context.Context) (*models.TaskType, error) {
	// First try to get the feature type as default
	var taskType models.TaskType
	err := r.pool.QueryRow(ctx, `
		SELECT id, name, code, description, display_order
		FROM task_types
		WHERE name = 'feature'
		LIMIT 1
	`).Scan(&taskType.ID, &taskType.Name, &taskType.Code, &taskType.Description, &taskType.DisplayOrder)
	if err == nil {
		return &taskType, nil
	}

	// If feature type not found, get the first available type
	err = r.pool.QueryRow(ctx, `
		SELECT id, name, code, description, display_order
		FROM task_types
		ORDER BY display_order ASC
		LIMIT 1
	`).Scan(&taskType.ID, &taskType.Name, &taskType.Code, &taskType.Description, &taskType.DisplayOrder)
	if err != nil {
		// If no task types exist, create default types
		if err := r.InitializeTaskTypes(ctx); err != nil {
			return nil, fmt.Errorf("failed to initialize default task types: %w", err)
		}
		// Try one more time to get the default type
		err = r.pool.QueryRow(ctx, `
			SELECT id, name, code, description, display_order
			FROM task_types
			WHERE name = 'feature'
			LIMIT 1
		`).Scan(&taskType.ID, &taskType.Name, &taskType.Code, &taskType.Description, &taskType.DisplayOrder)
		if err != nil {
			return nil, fmt.Errorf("failed to get default task type after initialization: %w", err)
		}
	}
	return &taskType, nil
}

// InitializeTaskTypes ensures that default task types exist in the database
func (r *TaskTypeRepository) InitializeTaskTypes(ctx context.Context) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO task_types (name, code, description, display_order)
		VALUES 
		('feature', 'feature', 'New feature or enhancement', 0),
		('bug', 'bug', 'Bug fix or issue resolution', 1),
		('docs', 'docs', 'Documentation update', 2),
		('chore', 'chore', 'Maintenance or cleanup task', 3)
		ON CONFLICT (name) DO NOTHING
	`)
	return err
}