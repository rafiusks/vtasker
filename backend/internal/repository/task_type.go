package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/internal/models"
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
func (r *TaskTypeRepository) GetDefaultTaskType(ctx context.Context) (*models.TaskTypeEntity, error) {
	var taskType models.TaskTypeEntity

	err := r.pool.QueryRow(ctx, `
		SELECT id, name, description, display_order
		FROM task_types
		WHERE name = $1
		LIMIT 1
	`, string(models.TypeFeature)).Scan(
		&taskType.ID,
		&taskType.Name,
		&taskType.Description,
		&taskType.DisplayOrder,
	)

	if err != nil {
		return nil, fmt.Errorf("error getting default task type: %v", err)
	}

	return &taskType, nil
}

// InitializeTaskTypes ensures that default task types exist in the database
func (r *TaskTypeRepository) InitializeTaskTypes(ctx context.Context) error {
	// Define default task types
	defaultTypes := []struct {
		name         string
		description  string
		displayOrder int32
	}{
		{string(models.TypeFeature), "New feature implementation", 1},
		{string(models.TypeBug), "Bug fix", 2},
		{string(models.TypeDocs), "Documentation", 3},
		{string(models.TypeChore), "Maintenance task", 4},
	}

	// Begin transaction
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Insert or update each task type
	for _, t := range defaultTypes {
		_, err := tx.Exec(ctx, `
			INSERT INTO task_types (name, description, display_order)
			VALUES ($1, $2, $3)
			ON CONFLICT (name) DO UPDATE
			SET description = EXCLUDED.description,
				display_order = EXCLUDED.display_order
		`, t.name, t.description, t.displayOrder)

		if err != nil {
			return fmt.Errorf("error upserting task type %s: %v", t.name, err)
		}
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	return nil
}