package repository

import (
	"context"
	"fmt"

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
		`INSERT INTO tasks (external_id, title, description, status, priority, type, "order", parent_id, board, column_name)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id`,
		task.ExternalID, task.Title, task.Description, task.Status, task.Priority,
		task.Type, task.Order, task.Parent, task.Board, task.Column).Scan(&id)
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
	for _, label := range task.Labels {
		_, err = tx.Exec(ctx,
			`INSERT INTO task_labels (task_id, label) VALUES ($1, $2)`,
			id, label)
		if err != nil {
			return fmt.Errorf("error inserting task label: %v", err)
		}
	}

	// Insert dependencies
	for _, dep := range task.Dependencies {
		_, err = tx.Exec(ctx,
			`INSERT INTO task_dependencies (dependent_task_id, dependency_external_id) VALUES ($1, $2)`,
			id, dep)
		if err != nil {
			return fmt.Errorf("error inserting task dependency: %v", err)
		}
	}

	// Insert acceptance criteria
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

	return tx.Commit(ctx)
}

// GetTask retrieves a task by its external ID with all related data
func (r *TaskRepository) GetTask(ctx context.Context, externalID string) (*models.Task, error) {
	var task models.Task
	var taskID string

	// Get main task data
	err := r.pool.QueryRow(ctx,
		`SELECT id, external_id, title, description, status, priority, type, "order",
			parent_id, board, column_name, created_at, updated_at
		FROM tasks WHERE external_id = $1`,
		externalID).Scan(
		&taskID, &task.ExternalID, &task.Title, &task.Description, &task.Status,
		&task.Priority, &task.Type, &task.Order, &task.Parent, &task.Board,
		&task.Column, &task.CreatedAt, &task.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error getting task: %v", err)
	}

	// Get task content
	task.Content = &models.TaskContent{}
	err = r.pool.QueryRow(ctx,
		`SELECT description, implementation_details, notes, due_date, assignee
		FROM task_contents WHERE task_id = $1`,
		taskID).Scan(
		&task.Content.Description, &task.Content.ImplementationDetails,
		&task.Content.Notes, &task.Content.DueDate, &task.Content.Assignee)
	if err != nil && err != pgx.ErrNoRows {
		return nil, fmt.Errorf("error getting task content: %v", err)
	}

	// Get labels
	rows, err := r.pool.Query(ctx,
		`SELECT label FROM task_labels WHERE task_id = $1`,
		taskID)
	if err != nil {
		return nil, fmt.Errorf("error getting task labels: %v", err)
	}
	defer rows.Close()

	task.Labels = make([]string, 0)
	for rows.Next() {
		var label string
		if err := rows.Scan(&label); err != nil {
			return nil, fmt.Errorf("error scanning task label: %v", err)
		}
		task.Labels = append(task.Labels, label)
	}

	// Get dependencies
	rows, err = r.pool.Query(ctx,
		`SELECT dependency_external_id FROM task_dependencies WHERE dependent_task_id = $1`,
		taskID)
	if err != nil {
		return nil, fmt.Errorf("error getting task dependencies: %v", err)
	}
	defer rows.Close()

	task.Dependencies = make([]string, 0)
	for rows.Next() {
		var depID string
		if err := rows.Scan(&depID); err != nil {
			return nil, fmt.Errorf("error scanning task dependency: %v", err)
		}
		task.Dependencies = append(task.Dependencies, depID)
	}

	// Get acceptance criteria
	rows, err = r.pool.Query(ctx,
		`SELECT id, description, completed, completed_at, completed_by, created_at,
			updated_at, "order", category, notes
		FROM acceptance_criteria
		WHERE task_id = $1
		ORDER BY "order"`,
		taskID)
	if err != nil {
		return nil, fmt.Errorf("error getting acceptance criteria: %v", err)
	}
	defer rows.Close()

	task.Content.AcceptanceCriteria = make([]models.AcceptanceCriterion, 0)
	for rows.Next() {
		var criterion models.AcceptanceCriterion
		if err := rows.Scan(
			&criterion.ID, &criterion.Description, &criterion.Completed,
			&criterion.CompletedAt, &criterion.CompletedBy, &criterion.CreatedAt,
			&criterion.UpdatedAt, &criterion.Order, &criterion.Category,
			&criterion.Notes); err != nil {
			return nil, fmt.Errorf("error scanning acceptance criterion: %v", err)
		}
		task.Content.AcceptanceCriteria = append(task.Content.AcceptanceCriteria, criterion)
	}

	return &task, nil
}

// ListTasks retrieves all tasks with optional filtering
func (r *TaskRepository) ListTasks(ctx context.Context, status, priority string) ([]models.Task, error) {
	query := `
		SELECT t.id, t.external_id, t.title, t.description, t.status, t.priority,
			t.type, t."order", t.parent_id, t.board, t.column_name, t.created_at, t.updated_at
		FROM tasks t
		WHERE ($1 = '' OR t.status = $1)
		AND ($2 = '' OR t.priority = $2)
		ORDER BY t.status, t."order"`

	rows, err := r.pool.Query(ctx, query, status, priority)
	if err != nil {
		return nil, fmt.Errorf("error listing tasks: %v", err)
	}
	defer rows.Close()

	tasks := make([]models.Task, 0)
	for rows.Next() {
		var task models.Task
		if err := rows.Scan(
			&task.ID, &task.ExternalID, &task.Title, &task.Description,
			&task.Status, &task.Priority, &task.Type, &task.Order,
			&task.Parent, &task.Board, &task.Column,
			&task.CreatedAt, &task.UpdatedAt); err != nil {
			return nil, fmt.Errorf("error scanning task: %v", err)
		}
		tasks = append(tasks, task)
	}

	return tasks, nil
}

// UpdateTask updates a task and its related data
func (r *TaskRepository) UpdateTask(ctx context.Context, externalID string, task *models.Task) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Update main task
	var taskID string
	err = tx.QueryRow(ctx,
		`UPDATE tasks
		SET title = $1, description = $2, status = $3, priority = $4,
			type = $5, "order" = $6, parent_id = $7, board = $8, column_name = $9
		WHERE external_id = $10
		RETURNING id`,
		task.Title, task.Description, task.Status, task.Priority,
		task.Type, task.Order, task.Parent, task.Board, task.Column,
		externalID).Scan(&taskID)
	if err != nil {
		return fmt.Errorf("error updating task: %v", err)
	}

	// Update task content
	if task.Content != nil {
		_, err = tx.Exec(ctx,
			`INSERT INTO task_contents (task_id, description, implementation_details,
				notes, due_date, assignee)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (task_id) DO UPDATE SET
				description = EXCLUDED.description,
				implementation_details = EXCLUDED.implementation_details,
				notes = EXCLUDED.notes,
				due_date = EXCLUDED.due_date,
				assignee = EXCLUDED.assignee`,
			taskID, task.Content.Description, task.Content.ImplementationDetails,
			task.Content.Notes, task.Content.DueDate, task.Content.Assignee)
		if err != nil {
			return fmt.Errorf("error updating task content: %v", err)
		}
	}

	// Update labels
	_, err = tx.Exec(ctx, `DELETE FROM task_labels WHERE task_id = $1`, taskID)
	if err != nil {
		return fmt.Errorf("error deleting task labels: %v", err)
	}

	for _, label := range task.Labels {
		_, err = tx.Exec(ctx,
			`INSERT INTO task_labels (task_id, label) VALUES ($1, $2)`,
			taskID, label)
		if err != nil {
			return fmt.Errorf("error inserting task label: %v", err)
		}
	}

	// Update dependencies
	_, err = tx.Exec(ctx,
		`DELETE FROM task_dependencies WHERE dependent_task_id = $1`,
		taskID)
	if err != nil {
		return fmt.Errorf("error deleting task dependencies: %v", err)
	}

	for _, dep := range task.Dependencies {
		_, err = tx.Exec(ctx,
			`INSERT INTO task_dependencies (dependent_task_id, dependency_external_id)
			VALUES ($1, $2)`,
			taskID, dep)
		if err != nil {
			return fmt.Errorf("error inserting task dependency: %v", err)
		}
	}

	return tx.Commit(ctx)
}

// MoveTask updates a task's status and order, recording the status change
func (r *TaskRepository) MoveTask(ctx context.Context, externalID string, status string, order int) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	var oldStatus string
	err = tx.QueryRow(ctx,
		`SELECT status FROM tasks WHERE external_id = $1`,
		externalID).Scan(&oldStatus)
	if err != nil {
		return fmt.Errorf("error getting task status: %v", err)
	}

	// Update task status and order
	_, err = tx.Exec(ctx,
		`UPDATE tasks SET status = $1, "order" = $2 WHERE external_id = $3`,
		status, order, externalID)
	if err != nil {
		return fmt.Errorf("error updating task status: %v", err)
	}

	// Record status change if status changed
	if oldStatus != status {
		_, err = tx.Exec(ctx,
			`INSERT INTO status_history (task_id, from_status, to_status)
			SELECT id, $1, $2 FROM tasks WHERE external_id = $3`,
			oldStatus, status, externalID)
		if err != nil {
			return fmt.Errorf("error recording status change: %v", err)
		}
	}

	return tx.Commit(ctx)
}

// DeleteTask deletes a task and all its related data
func (r *TaskRepository) DeleteTask(ctx context.Context, externalID string) error {
	_, err := r.pool.Exec(ctx,
		`DELETE FROM tasks WHERE external_id = $1`,
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
		`SELECT COUNT(*) FROM task_dependencies WHERE dependency_external_id = $1`,
		externalID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("error counting dependent tasks: %v", err)
	}
	return count, nil
} 