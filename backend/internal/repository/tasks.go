package repository

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/internal/models"
)

type TaskRepository struct {
	pool *pgxpool.Pool
}

func NewTaskRepository(pool *pgxpool.Pool) *TaskRepository {
	return &TaskRepository{pool: pool}
}

// CreateTask creates a new task with all its related data
func (r *TaskRepository) CreateTask(ctx context.Context, task *models.Task) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Insert main task
	var id string
	err = tx.QueryRow(ctx,
		`INSERT INTO tasks (title, description, status_id, priority_id, type, "order")
		VALUES ($1, $2, $3, $4, CAST($5 AS task_priority), CAST($6 AS task_type), $7)
		RETURNING id`,
		task.Title, task.Description, task.StatusID, task.PriorityID,
		task.Type, task.Order).Scan(&id)
	if err != nil {
		return fmt.Errorf("error inserting task: %v", err)
	}

	// Insert task content
	if task.Content != nil {
		_, err = tx.Exec(ctx,
			`INSERT INTO task_contents (task_id, description, implementation_details, notes, due_date, assignee)
			VALUES ($1, $2, $3, $4, $5, $6)`,
			id, task.Content.Description, task.Content.ImplementationDetails,
			task.Content.Notes, task.Content.DueDate, task.Content.Assignee)
		if err != nil {
			return fmt.Errorf("error inserting task content: %v", err)
		}
	}

	// Insert labels
	for _, label := range task.Relationships.Labels {
		_, err = tx.Exec(ctx,
			`INSERT INTO task_labels (task_id, label) VALUES ($1, $2)`,
			id, label)
		if err != nil {
			return fmt.Errorf("error inserting task label: %v", err)
		}
	}

	// Insert dependencies
	for _, dep := range task.Relationships.Dependencies {
		_, err = tx.Exec(ctx,
			`INSERT INTO task_dependencies (dependent_task_id, dependency_id) VALUES ($1, $2)`,
			id, dep)
		if err != nil {
			return fmt.Errorf("error inserting task dependency: %v", err)
		}
	}

	// Insert acceptance criteria
	if task.Content != nil {
		for _, criterion := range task.Content.AcceptanceCriteria {
			_, err = tx.Exec(ctx,
				`INSERT INTO acceptance_criteria (task_id, description, completed, completed_at, completed_by, "order", category, notes)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
				id, criterion.Description, criterion.Completed, criterion.CompletedAt,
				criterion.CompletedBy, criterion.Order, criterion.Category, criterion.Notes)
			if err != nil {
				return fmt.Errorf("error inserting acceptance criterion: %v", err)
			}
		}
	}

	return tx.Commit(ctx)
}

// GetTask retrieves a task by its external ID with all related data
func (r *TaskRepository) GetTask(ctx context.Context, taskID string) (*models.Task, error) {
	query := `
		SELECT 
			t.id,
			t.title,
			t.description,
			t.status_id,
			t.priority_id,
			t.type,
			t.order,
			t.created_at,
			t.updated_at,
			ts.code AS status_code,
			ts.name AS status_name,
			ts.display_order AS status_display_order
		FROM tasks t
		JOIN task_statuses ts ON t.status_id = ts.id
		WHERE t.id = $1`

	var task models.Task
	var statusCode string
	var statusName string
	var statusDisplayOrder int

	err := r.pool.QueryRow(ctx, query, taskID).Scan(
		&task.ID,
		&task.Title,
		&task.Description,
		&task.StatusID,
		&task.PriorityID,
		&task.Type,
		&task.Order,
		&task.CreatedAt,
		&task.UpdatedAt,
		&statusCode,
		&statusName,
		&statusDisplayOrder,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error getting task: %v", err)
	}

	// Initialize empty structs for JSON fields
	task.Content = &models.TaskContent{}
	task.Relationships = models.TaskRelationships{}
	task.Metadata = models.TaskMetadata{}
	task.Progress = models.TaskProgress{}

	// Set up the status
	task.Status = &models.TaskStatusEntity{
		ID:           task.StatusID,
		Code:         models.TaskStatusCode(statusCode),
		Name:         statusName,
		DisplayOrder: statusDisplayOrder,
	}

	return &task, nil
}

// scanTask scans a task row into a Task struct
func scanTask(row pgx.Row) (*models.Task, error) {
	var task models.Task
	var statusID *int
	var statusCode *string
	var statusDescription *string
	var statusDisplayOrder *int
	var statusCreatedAt *time.Time
	var statusUpdatedAt *time.Time
	var totalCriteria, completedCriteria int

	err := row.Scan(
		&task.ID,
		&task.Title,
		&task.Description,
		&task.StatusID,
		&task.PriorityID,
		&task.Type,
		&task.Order,
		&task.Relationships.Parent,
		&task.Metadata.Board,
		&task.Metadata.Column,
		&task.Metadata.CreatedAt,
		&task.Metadata.UpdatedAt,
		&totalCriteria,
		&completedCriteria,
	)
	if err != nil {
		return nil, fmt.Errorf("error scanning task: %v", err)
	}

	// Set the status if we have one
	if statusID != nil {
		task.StatusID = *statusID
		task.Status = &models.TaskStatusEntity{
			ID:           *statusID,
			Code:         models.TaskStatusCode(*statusCode),
			Description:  statusDescription,
			DisplayOrder: *statusDisplayOrder,
			CreatedAt:    *statusCreatedAt,
			UpdatedAt:    *statusUpdatedAt,
		}
	}

	// Set progress metrics
	task.Progress.AcceptanceCriteria.Total = totalCriteria
	task.Progress.AcceptanceCriteria.Completed = completedCriteria
	if totalCriteria > 0 {
		task.Progress.Percentage = int((float64(completedCriteria) / float64(totalCriteria)) * 100)
	}

	return &task, nil
}

// ListTasks retrieves all tasks with optional filtering
func (r *TaskRepository) ListTasks(ctx context.Context, statusFilter string, priorityFilter string) ([]models.Task, error) {
	query := `
		SELECT 
			t.id,
			t.title,
			t.description,
			t.status_id,
			t.priority_id,
			t.type,
			t.order,
			t.created_at,
			t.updated_at,
			ts.code AS status_code,
			ts.name AS status_name
		FROM tasks t
		JOIN task_statuses ts ON t.status_id = ts.id
		WHERE ($1 = '' OR ts.code = $1)
		AND ($2 = '' OR t.priority_id::text = $2)
		ORDER BY t.order`

	rows, err := r.pool.Query(ctx, query, statusFilter, priorityFilter)
	if err != nil {
		return nil, fmt.Errorf("error querying tasks: %v", err)
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		var statusCode, statusName string

		err := rows.Scan(
			&task.ID,
			&task.Title,
			&task.Description,
			&task.StatusID,
			&task.PriorityID,
			&task.Type,
			&task.Order,
			&task.CreatedAt,
			&task.UpdatedAt,
			&statusCode,
			&statusName,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning task: %v", err)
		}

		// Initialize empty structs for JSON fields
		task.Content = &models.TaskContent{}
		task.Relationships = models.TaskRelationships{}
		task.Metadata = models.TaskMetadata{}
		task.Progress = models.TaskProgress{}

		// Set up the status
		task.Status = &models.TaskStatusEntity{
			Code: models.TaskStatusCode(statusCode),
			Name: statusName,
		}

		tasks = append(tasks, task)
	}

	return tasks, nil
}

// UpdateTask updates a task and its related data
func (r *TaskRepository) UpdateTask(ctx context.Context, taskID string, task *models.Task) error {
	// Debug log
	log.Printf("Updating task %s with data: %+v", taskID, task)

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Update main task
	result, err := tx.Exec(ctx,
		`UPDATE tasks
		SET title = $1, 
			description = $2, 
			status_id = $3, 
			priority_id = $4,
			type = $5, 
			"order" = $6,
			updated_at = NOW()
		WHERE id = $7`,
		task.Title, 
		task.Description, 
		task.StatusID, 
		task.PriorityID,
		task.Type, 
		task.Order, 
		taskID)
	if err != nil {
		return fmt.Errorf("error updating task: %v", err)
	}

	// Debug log
	rows := result.RowsAffected()
	log.Printf("Updated %d rows for task %s", rows, taskID)

	return tx.Commit(ctx)
}

// MoveTaskByID updates a task's status and order
func (r *TaskRepository) MoveTaskByID(ctx context.Context, externalID string, statusID int, order int, comment *string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Get current task's status
	var currentStatusID int
	err = tx.QueryRow(ctx, `SELECT status_id FROM tasks WHERE id = $1`, externalID).Scan(&currentStatusID)
	if err != nil {
		return fmt.Errorf("error getting current status: %v", err)
	}

	// Shift tasks in target status down
	_, err = tx.Exec(ctx, `
		UPDATE tasks 
		SET "order" = "order" + 1
		WHERE status_id = $1 
		AND "order" >= $2
	`, statusID, order)
	if err != nil {
		return fmt.Errorf("error shifting tasks down: %v", err)
	}

	// Record status change
	_, err = tx.Exec(ctx, `
		INSERT INTO status_history (task_id, from_status_id, to_status_id, comment, changed_at)
		VALUES ($1, $2, $3, $4, NOW())
	`, externalID, currentStatusID, statusID, comment)
	if err != nil {
		return fmt.Errorf("error recording status change: %v", err)
	}

	// Finally, update the task itself
	_, err = tx.Exec(ctx, `
		UPDATE tasks 
		SET status_id = $2, 
			"order" = $3,
			updated_at = NOW()
		WHERE id = $1
	`, externalID, statusID, order)
	if err != nil {
		return fmt.Errorf("error updating task: %v", err)
	}

	return tx.Commit(ctx)
}

// ReorderTaskByID updates a task's order within the same status column
func (r *TaskRepository) ReorderTaskByID(ctx context.Context, externalID string, statusID int, order int) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Get current task's order
	var currentOrder int
	err = tx.QueryRow(ctx, `SELECT "order" FROM tasks WHERE id = $1`, externalID).Scan(&currentOrder)
	if err != nil {
		return fmt.Errorf("error getting current order: %v", err)
	}

	if currentOrder < order {
		// Moving down - shift tasks up
		_, err = tx.Exec(ctx, `
			UPDATE tasks 
			SET "order" = "order" - 1
			WHERE status_id = $1 
			AND "order" > $2 
			AND "order" <= $3
		`, statusID, currentOrder, order)
	} else {
		// Moving up - shift tasks down
		_, err = tx.Exec(ctx, `
			UPDATE tasks 
			SET "order" = "order" + 1
			WHERE status_id = $1 
			AND "order" >= $2 
			AND "order" < $3
		`, statusID, order, currentOrder)
	}
	if err != nil {
		return fmt.Errorf("error reordering tasks: %v", err)
	}

	// Update the task's order
	_, err = tx.Exec(ctx, `
		UPDATE tasks 
		SET "order" = $2,
			updated_at = NOW()
		WHERE id = $1
	`, externalID, order)
	if err != nil {
		return fmt.Errorf("error updating task order: %v", err)
	}

	return tx.Commit(ctx)
}

// DeleteTask deletes a task and all its related data
func (r *TaskRepository) DeleteTask(ctx context.Context, externalID string) error {
	_, err := r.pool.Exec(ctx,
		`DELETE FROM tasks WHERE id = $1`,
		externalID)
	if err != nil {
		return fmt.Errorf("error deleting task: %v", err)
	}
	return nil
}

// GetDependentTasks returns the count of tasks that depend on the given task
func (r *TaskRepository) GetDependentTasks(ctx context.Context, externalID string) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM task_dependencies WHERE dependency_id = $1`,
		externalID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("error counting dependent tasks: %v", err)
	}
	return count, nil
}

// GetTaskDetails retrieves detailed task information by its external ID
func (r *TaskRepository) GetTaskDetails(ctx context.Context, externalID string) (*models.Task, error) {
	// Reuse the existing GetTask function as it already fetches all necessary details
	return r.GetTask(ctx, externalID)
}

// ListTaskStatuses retrieves all task statuses
func (r *TaskRepository) ListTaskStatuses(ctx context.Context) ([]models.TaskStatusEntity, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, code, name, description, display_order, created_at, updated_at
		FROM task_statuses
		ORDER BY display_order
	`)
	if err != nil {
		return nil, fmt.Errorf("error listing task statuses: %v", err)
	}
	defer rows.Close()

	var statuses []models.TaskStatusEntity
	for rows.Next() {
		var status models.TaskStatusEntity
		if err := rows.Scan(
			&status.ID,
			&status.Code,
			&status.Name,
			&status.Description,
			&status.DisplayOrder,
			&status.CreatedAt,
			&status.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning task status: %v", err)
		}
		statuses = append(statuses, status)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning task statuses: %v", err)
	}

	return statuses, nil
}

// ListTaskPriorities retrieves all task priorities
func (r *TaskRepository) ListTaskPriorities(ctx context.Context) ([]models.TaskPriorityEntity, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, code, name, description, display_order, created_at, updated_at
		FROM task_priorities
		ORDER BY display_order
	`)
	if err != nil {
		return nil, fmt.Errorf("error listing task priorities: %v", err)
	}
	defer rows.Close()

	var priorities []models.TaskPriorityEntity
	for rows.Next() {
		var priority models.TaskPriorityEntity
		if err := rows.Scan(
			&priority.ID,
			&priority.Code,
			&priority.Name,
			&priority.Description,
			&priority.DisplayOrder,
			&priority.CreatedAt,
			&priority.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning task priority: %v", err)
		}
		priorities = append(priorities, priority)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning task priorities: %v", err)
	}

	return priorities, nil
}

// Add to TaskRepository
func (r *TaskRepository) Ping(ctx context.Context) error {
	return r.pool.Ping(ctx)
}

func (r *TaskRepository) BeginTx(ctx context.Context) (pgx.Tx, error) {
	return r.pool.Begin(ctx)
} 