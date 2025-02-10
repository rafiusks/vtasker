package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/backend/internal/models"
)

// TaskRepository handles database operations for tasks
type TaskRepository struct {
	db *pgxpool.Pool
}

// TaskFilters represents the available filters for tasks
type TaskFilters struct {
	Status   models.StatusCode
	Priority models.PriorityCode
	Type     models.TypeCode
}

// NewTaskRepository creates a new task repository
func NewTaskRepository(db *pgxpool.Pool) *TaskRepository {
	return &TaskRepository{db: db}
}

// GetPool returns the database connection pool
func (r *TaskRepository) GetPool() *pgxpool.Pool {
	return r.db
}

// GetTask retrieves a task by ID
func (r *TaskRepository) GetTask(ctx context.Context, id string) (*models.Task, error) {
	var task models.Task
	var taskContent, metadata, progress []byte

	query := `
		SELECT 
			t.id, 
			t.title,
			t.status,
			t.priority,
			t.type,
			t.content,
			t.metadata,
			t.progress,
			t.created_by,
			t.updated_by
		FROM tasks t
		WHERE t.id = $1`

	err := r.db.QueryRow(ctx, query, id).Scan(
		&task.ID,
		&task.Title,
		&task.Status,
		&task.Priority,
		&task.Type,
		&taskContent,
		&metadata,
		&progress,
		&task.CreatedBy,
		&task.UpdatedBy,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("task not found")
		}
		log.Printf("Error querying task: %v", err)
		return nil, fmt.Errorf("error getting task: %v", err)
	}

	// Parse JSON fields
	if len(taskContent) > 0 {
		if err := json.Unmarshal(taskContent, &task.Content); err != nil {
			log.Printf("Error unmarshaling task content: %v", err)
			return nil, fmt.Errorf("error unmarshaling task content: %v", err)
		}
	}
	if len(metadata) > 0 {
		if err := json.Unmarshal(metadata, &task.Metadata); err != nil {
			log.Printf("Error unmarshaling metadata: %v", err)
			return nil, fmt.Errorf("error unmarshaling metadata: %v", err)
		}
	}
	if len(progress) > 0 {
		if err := json.Unmarshal(progress, &task.Progress); err != nil {
			log.Printf("Error unmarshaling progress: %v", err)
			return nil, fmt.Errorf("error unmarshaling progress: %v", err)
		}
	}

	return &task, nil
}

// CreateTask creates a new task
func (r *TaskRepository) CreateTask(ctx context.Context, input *models.CreateTaskInput, createdBy string) (*models.Task, error) {
	createdByUUID, err := uuid.Parse(createdBy)
	if err != nil {
		return nil, fmt.Errorf("invalid created_by UUID: %v", err)
	}

	task := models.NewTask(*input, createdByUUID)

	query := `
		INSERT INTO tasks (
			id, 
			title,
			status,
			priority,
			type,
			content,
			metadata,
			progress,
			created_by,
			updated_by
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id`

	contentJSON, err := json.Marshal(task.Content)
	if err != nil {
		return nil, fmt.Errorf("error marshaling content: %v", err)
	}

	metadataJSON, err := json.Marshal(task.Metadata)
	if err != nil {
		return nil, fmt.Errorf("error marshaling metadata: %v", err)
	}

	progressJSON, err := json.Marshal(task.Progress)
	if err != nil {
		return nil, fmt.Errorf("error marshaling progress: %v", err)
	}

	err = r.db.QueryRow(ctx, query,
		task.ID,
		task.Title,
		task.Status,
		task.Priority,
		task.Type,
		contentJSON,
		metadataJSON,
		progressJSON,
		task.CreatedBy,
		task.UpdatedBy,
	).Scan(&task.ID)

	if err != nil {
		return nil, fmt.Errorf("error creating task: %v", err)
	}

	return task, nil
}

// UpdateTask updates an existing task
func (r *TaskRepository) UpdateTask(ctx context.Context, id string, input *models.UpdateTaskInput, updatedBy string) (*models.Task, error) {
	updatedByUUID, err := uuid.Parse(updatedBy)
	if err != nil {
		return nil, fmt.Errorf("invalid updated_by UUID: %v", err)
	}

	task, err := r.GetTask(ctx, id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided in input
	if input.Title != nil {
		task.Title = *input.Title
	}
	if input.Status != nil {
		task.Status = *input.Status
	}
	if input.Priority != nil {
		task.Priority = *input.Priority
	}
	if input.Type != nil {
		task.Type = *input.Type
	}
	if input.Content != nil {
		// Update content fields if provided
		if input.Content.Description != nil {
			task.Content.Description = *input.Content.Description
		}
		if input.Content.ImplementationDetails != nil {
			task.Content.ImplementationDetails = *input.Content.ImplementationDetails
		}
		if input.Content.Notes != nil {
			task.Content.Notes = *input.Content.Notes
		}
		if input.Content.Attachments != nil {
			task.Content.Attachments = input.Content.Attachments
		}
		if input.Content.DueDate != nil {
			task.Content.DueDate = input.Content.DueDate
		}
		if input.Content.Assignee != nil {
			task.Content.Assignee = input.Content.Assignee
		}
	}

	task.UpdatedBy = updatedByUUID

	query := `
		UPDATE tasks 
		SET 
			title = $1,
			status = $2,
			priority = $3,
			type = $4,
			content = $5,
			metadata = $6,
			progress = $7,
			updated_by = $8
		WHERE id = $9`

	contentJSON, err := json.Marshal(task.Content)
	if err != nil {
		return nil, fmt.Errorf("error marshaling content: %v", err)
	}

	metadataJSON, err := json.Marshal(task.Metadata)
	if err != nil {
		return nil, fmt.Errorf("error marshaling metadata: %v", err)
	}

	progressJSON, err := json.Marshal(task.Progress)
	if err != nil {
		return nil, fmt.Errorf("error marshaling progress: %v", err)
	}

	_, err = r.db.Exec(ctx, query,
		task.Title,
		task.Status,
		task.Priority,
		task.Type,
		contentJSON,
		metadataJSON,
		progressJSON,
		task.UpdatedBy,
		task.ID,
	)

	if err != nil {
		return nil, fmt.Errorf("error updating task: %v", err)
	}

	return task, nil
}

// DeleteTask deletes a task by ID
func (r *TaskRepository) DeleteTask(ctx context.Context, id string) error {
	query := `DELETE FROM tasks WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("error deleting task: %v", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("task not found")
	}

	return nil
}

// GetTasks retrieves all tasks with optional filtering
func (r *TaskRepository) GetTasks(ctx context.Context, filters TaskFilters) ([]*models.Task, error) {
	var tasks []*models.Task

	query := `
		SELECT 
			t.id, 
			t.title,
			t.status,
			t.priority,
			t.type,
			t.content,
			t.metadata,
			t.progress,
			t.created_by,
			t.updated_by
		FROM tasks t
		WHERE 1=1`

	args := []interface{}{}
	argNum := 1

	// Add filters
	if filters.Status != "" {
		query += fmt.Sprintf(" AND t.status = $%d", argNum)
		args = append(args, filters.Status)
		argNum++
	}
	if filters.Priority != "" {
		query += fmt.Sprintf(" AND t.priority = $%d", argNum)
		args = append(args, filters.Priority)
		argNum++
	}
	if filters.Type != "" {
		query += fmt.Sprintf(" AND t.type = $%d", argNum)
		args = append(args, filters.Type)
		argNum++
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying tasks: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var task models.Task
		var taskContent, metadata, progress []byte

		err := rows.Scan(
			&task.ID,
			&task.Title,
			&task.Status,
			&task.Priority,
			&task.Type,
			&taskContent,
			&metadata,
			&progress,
			&task.CreatedBy,
			&task.UpdatedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning task row: %v", err)
		}

		// Parse JSON fields
		if len(taskContent) > 0 {
			if err := json.Unmarshal(taskContent, &task.Content); err != nil {
				return nil, fmt.Errorf("error unmarshaling task content: %v", err)
			}
		}
		if len(metadata) > 0 {
			if err := json.Unmarshal(metadata, &task.Metadata); err != nil {
				return nil, fmt.Errorf("error unmarshaling metadata: %v", err)
			}
		}
		if len(progress) > 0 {
			if err := json.Unmarshal(progress, &task.Progress); err != nil {
				return nil, fmt.Errorf("error unmarshaling progress: %v", err)
			}
		}

		tasks = append(tasks, &task)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating task rows: %v", err)
	}

	return tasks, nil
}

// ListTaskStatuses returns a list of all task statuses
func (r *TaskRepository) ListTaskStatuses(ctx context.Context) ([]models.TaskStatus, error) {
	query := `
		SELECT id, code, name, description, display_order, created_at, updated_at
		FROM task_statuses
		ORDER BY display_order
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error listing task statuses: %v", err)
	}
	defer rows.Close()

	var statuses []models.TaskStatus
	for rows.Next() {
		var status models.TaskStatus
		err := rows.Scan(
			&status.ID,
			&status.Code,
			&status.Name,
			&status.Description,
			&status.DisplayOrder,
			&status.CreatedAt,
			&status.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning task status: %v", err)
		}
		statuses = append(statuses, status)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating task statuses: %v", err)
	}

	if statuses == nil {
		statuses = make([]models.TaskStatus, 0)
	}

	return statuses, nil
}

// ListTaskPriorities returns a list of all task priorities
func (r *TaskRepository) ListTaskPriorities(ctx context.Context) ([]models.TaskPriority, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, name, display_order
		FROM task_priorities
		ORDER BY display_order
	`)
	if err != nil {
		return nil, fmt.Errorf("error listing task priorities: %v", err)
	}
	defer rows.Close()

	var priorities []models.TaskPriority
	for rows.Next() {
		var priority models.TaskPriority
		err := rows.Scan(
			&priority.ID,
			&priority.Name,
			&priority.DisplayOrder,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning task priority: %v", err)
		}
		priorities = append(priorities, priority)
	}
	return priorities, nil
}

// ListTaskTypes returns a list of all task types
func (r *TaskRepository) ListTaskTypes(ctx context.Context) ([]models.TaskType, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, code, name, description, display_order, created_at, updated_at
		FROM task_types
		ORDER BY display_order
	`)
	if err != nil {
		return nil, fmt.Errorf("error listing task types: %v", err)
	}
	defer rows.Close()

	var types []models.TaskType
	for rows.Next() {
		var t models.TaskType
		err := rows.Scan(
			&t.ID,
			&t.Code,
			&t.Name,
			&t.Description,
			&t.DisplayOrder,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning task type: %v", err)
		}
		types = append(types, t)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating task types: %v", err)
	}

	return types, nil
}

// BeginTx starts a new transaction
func (r *TaskRepository) BeginTx(ctx context.Context) (pgx.Tx, error) {
	return r.db.Begin(ctx)
}

// Ping checks if the database connection is alive
func (r *TaskRepository) Ping(ctx context.Context) error {
	return r.db.Ping(ctx)
}