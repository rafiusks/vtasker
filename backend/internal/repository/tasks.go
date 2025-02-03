package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

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
		task.Type, task.Order, task.Relationships.Parent, task.Metadata.Board, task.Metadata.Column).Scan(&id)
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
			`INSERT INTO task_dependencies (dependent_task_id, dependency_external_id) VALUES ($1, $2)`,
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
func (r *TaskRepository) GetTask(ctx context.Context, externalID string) (*models.Task, error) {
	var task models.Task
	var taskID string
	var totalCriteria, completedCriteria int

	// Get main task data with metrics
	err := r.pool.QueryRow(ctx,
		`WITH task_metrics AS (
			SELECT 
				task_id,
				COUNT(*) as total_criteria,
				COUNT(*) FILTER (WHERE completed) as completed_criteria
			FROM acceptance_criteria
			WHERE task_id = (SELECT id FROM tasks WHERE external_id = $1)
			GROUP BY task_id
		)
		SELECT t.id, t.external_id, t.title, t.description, t.status, t.priority,
			t.type, t."order", t.parent_id, t.board, t.column_name, t.created_at, t.updated_at,
			COALESCE(m.total_criteria, 0), COALESCE(m.completed_criteria, 0)
		FROM tasks t
		LEFT JOIN task_metrics m ON t.id = m.task_id
		WHERE t.external_id = $1`,
		externalID).Scan(
		&taskID, &task.ExternalID, &task.Title, &task.Description, &task.Status,
		&task.Priority, &task.Type, &task.Order, &task.Relationships.Parent, 
		&task.Metadata.Board, &task.Metadata.Column, &task.Metadata.CreatedAt, 
		&task.Metadata.UpdatedAt, &totalCriteria, &completedCriteria)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error getting task: %v", err)
	}

	// Initialize task ID and relationships
	task.ID = taskID
	task.Relationships.Labels = make([]string, 0)
	task.Relationships.Dependencies = make([]string, 0)
	task.StatusHistory = make([]models.StatusChange, 0)
	task.Content = &models.TaskContent{
		AcceptanceCriteria: make([]models.AcceptanceCriterion, 0),
		Attachments:        make([]string, 0),
	}

	// Set progress metrics
	task.Progress.AcceptanceCriteria.Total = totalCriteria
	task.Progress.AcceptanceCriteria.Completed = completedCriteria
	if totalCriteria > 0 {
		task.Progress.Percentage = int((float64(completedCriteria) / float64(totalCriteria)) * 100)
	}

	// Get task content
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

	for rows.Next() {
		var label string
		if err := rows.Scan(&label); err != nil {
			return nil, fmt.Errorf("error scanning task label: %v", err)
		}
		task.Relationships.Labels = append(task.Relationships.Labels, label)
	}

	// Get dependencies
	rows, err = r.pool.Query(ctx,
		`SELECT dependency_external_id FROM task_dependencies WHERE dependent_task_id = $1`,
		taskID)
	if err != nil {
		return nil, fmt.Errorf("error getting task dependencies: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var depID string
		if err := rows.Scan(&depID); err != nil {
			return nil, fmt.Errorf("error scanning task dependency: %v", err)
		}
		task.Relationships.Dependencies = append(task.Relationships.Dependencies, depID)
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

	// Get status history
	rows, err = r.pool.Query(ctx,
		`SELECT from_status, to_status, changed_at, comment
		FROM status_history
		WHERE task_id = $1
		ORDER BY changed_at DESC`,
		taskID)
	if err != nil {
		return nil, fmt.Errorf("error getting status history: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var change models.StatusChange
		if err := rows.Scan(
			&change.From, &change.To, &change.Timestamp, &change.Comment); err != nil {
			return nil, fmt.Errorf("error scanning status change: %v", err)
		}
		task.StatusHistory = append(task.StatusHistory, change)
	}

	return &task, nil
}

// ListTasks retrieves all tasks with optional filtering
func (r *TaskRepository) ListTasks(ctx context.Context, status, priority string) ([]models.Task, error) {
	log.Printf("Listing tasks with status=%q, priority=%q", status, priority)

	query := `
		WITH task_metrics AS (
			SELECT 
				task_id,
				COUNT(*) as total_criteria,
				COUNT(*) FILTER (WHERE completed) as completed_criteria
			FROM acceptance_criteria
			GROUP BY task_id
		),
		task_history AS (
			SELECT 
				task_id,
				json_agg(
					json_build_object(
						'from', from_status,
						'to', to_status,
						'timestamp', changed_at,
						'comment', comment
					) ORDER BY changed_at DESC
				) as history
			FROM status_history
			GROUP BY task_id
		)
		SELECT 
			t.id, 
			t.external_id, 
			t.title, 
			t.description, 
			t.status, 
			t.priority,
			t.type, 
			t."order", 
			t.parent_id, 
			t.board, 
			t.column_name, 
			t.created_at, 
			t.updated_at,
			tc.description as content_description,
			tc.implementation_details,
			tc.notes as content_notes,
			tc.due_date,
			tc.assignee,
			COALESCE(m.total_criteria, 0) as total_criteria,
			COALESCE(m.completed_criteria, 0) as completed_criteria,
			(
				SELECT COALESCE(json_agg(label), '[]'::json)
				FROM task_labels tl
				WHERE tl.task_id = t.id
			) as labels,
			(
				SELECT COALESCE(json_agg(dependency_external_id), '[]'::json)
				FROM task_dependencies td
				WHERE td.dependent_task_id = t.id
			) as dependencies,
			COALESCE(th.history, '[]'::json) as status_history
		FROM tasks t
		LEFT JOIN task_contents tc ON t.id = tc.task_id
		LEFT JOIN task_metrics m ON t.id = m.task_id
		LEFT JOIN task_history th ON t.id = th.task_id
		WHERE ($1 = '' OR t.status::text = $1)
		AND ($2 = '' OR t.priority::text = $2)
		ORDER BY t.status, t."order"`

	rows, err := r.pool.Query(ctx, query, status, priority)
	if err != nil {
		log.Printf("Database error: %v", err)
		return nil, fmt.Errorf("error listing tasks: %v", err)
	}
	defer rows.Close()

	tasks := make([]models.Task, 0)
	for rows.Next() {
		var task models.Task
		task.Content = &models.TaskContent{
			AcceptanceCriteria: make([]models.AcceptanceCriterion, 0),
			Attachments:        make([]string, 0),
		}
		task.Relationships = models.TaskRelationships{
			Labels:       make([]string, 0),
			Dependencies: make([]string, 0),
		}
		task.Progress = models.TaskProgress{
			AcceptanceCriteria: struct {
				Total     int `json:"total"`
				Completed int `json:"completed"`
			}{},
		}
		var totalCriteria, completedCriteria int
		var labelsJSON, dependenciesJSON, statusHistoryJSON []byte

		if err := rows.Scan(
			&task.ID, &task.ExternalID, &task.Title, &task.Description,
			&task.Status, &task.Priority, &task.Type, &task.Order,
			&task.Relationships.Parent, &task.Metadata.Board, &task.Metadata.Column,
			&task.Metadata.CreatedAt, &task.Metadata.UpdatedAt,
			&task.Content.Description,
			&task.Content.ImplementationDetails,
			&task.Content.Notes,
			&task.Content.DueDate,
			&task.Content.Assignee,
			&totalCriteria,
			&completedCriteria,
			&labelsJSON,
			&dependenciesJSON,
			&statusHistoryJSON,
		); err != nil {
			log.Printf("Error scanning task: %v", err)
			return nil, fmt.Errorf("error scanning task: %v", err)
		}

		// Set progress metrics
		task.Progress.AcceptanceCriteria.Total = totalCriteria
		task.Progress.AcceptanceCriteria.Completed = completedCriteria
		if totalCriteria > 0 {
			task.Progress.Percentage = int((float64(completedCriteria) / float64(totalCriteria)) * 100)
		}

		// Parse JSON arrays
		if err := json.Unmarshal(labelsJSON, &task.Relationships.Labels); err != nil {
			return nil, fmt.Errorf("error parsing labels: %v", err)
		}
		if err := json.Unmarshal(dependenciesJSON, &task.Relationships.Dependencies); err != nil {
			return nil, fmt.Errorf("error parsing dependencies: %v", err)
		}
		if err := json.Unmarshal(statusHistoryJSON, &task.StatusHistory); err != nil {
			return nil, fmt.Errorf("error parsing status history: %v", err)
		}

		tasks = append(tasks, task)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error after scanning: %v", err)
		return nil, fmt.Errorf("error after scanning: %v", err)
	}

	log.Printf("Found %d tasks", len(tasks))
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
		task.Type, task.Order, task.Relationships.Parent, task.Metadata.Board, task.Metadata.Column,
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

	for _, label := range task.Relationships.Labels {
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

	for _, dep := range task.Relationships.Dependencies {
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
	// Use a single query to update the task and record status history if needed
	_, err := r.pool.Exec(ctx, `
		WITH task_update AS (
			UPDATE tasks 
			SET status = $2, 
				"order" = $3,
				updated_at = NOW()
			WHERE external_id = $1
			RETURNING id, status != $2 as status_changed, status as old_status
		)
		INSERT INTO status_history (task_id, from_status, to_status)
		SELECT id, old_status, $2 
		FROM task_update 
		WHERE status_changed;
	`, externalID, status, order)

	if err != nil {
		if err == pgx.ErrNoRows {
			return fmt.Errorf("task not found: %s", externalID)
		}
		return fmt.Errorf("error moving task: %v", err)
	}

	return nil
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

// GetTaskDetails retrieves detailed task information by its external ID
func (r *TaskRepository) GetTaskDetails(ctx context.Context, externalID string) (*models.Task, error) {
	// Reuse the existing GetTask function as it already fetches all necessary details
	return r.GetTask(ctx, externalID)
} 