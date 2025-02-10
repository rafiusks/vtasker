package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/internal/models"
)

// TaskRepository handles database operations for tasks
type TaskRepository struct {
	pool *pgxpool.Pool
}

// NewTaskRepository creates a new TaskRepository instance
func NewTaskRepository(pool *pgxpool.Pool) *TaskRepository {
	return &TaskRepository{pool: pool}
}

// GetPool returns the database connection pool
func (r *TaskRepository) GetPool() *pgxpool.Pool {
	return r.pool
}

// GetTaskStatus retrieves a task status by ID
func (r *TaskRepository) GetTaskStatus(ctx context.Context, id string) (*models.TaskStatusEntity, error) {
	var status models.TaskStatusEntity
	statusID, err := strconv.Atoi(id)
	if err != nil {
		return nil, fmt.Errorf("invalid status ID: %w", err)
	}

	err = r.pool.QueryRow(ctx, `
		SELECT id, name, description, "order", created_at, updated_at
		FROM task_statuses
		WHERE id = $1
	`, statusID).Scan(
		&status.ID,
		&status.Name,
		&status.Description,
		&status.DisplayOrder,
		&status.CreatedAt,
		&status.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("error getting task status: %v", err)
	}

	return &status, nil
}

// CreateTaskStatus creates a new task status
func (r *TaskRepository) CreateTaskStatus(ctx context.Context, status *models.TaskStatusEntity) error {
	err := r.pool.QueryRow(ctx, `
		INSERT INTO task_statuses (name, description, "order")
		VALUES ($1, $2, $3)
		RETURNING id
	`,
		status.Name,
		status.Description,
		status.DisplayOrder,
	).Scan(&status.ID)

	if err != nil {
		return fmt.Errorf("error creating task status: %v", err)
	}

	return nil
}

// GetTaskWithStatus retrieves a task with its status information
func (r *TaskRepository) GetTaskWithStatus(ctx context.Context, taskID string) (*models.Task, error) {
	query := `
		SELECT 
			t.id,
			t.title,
			t.description,
			t.status_id,
			t.priority_id,
			t.type_id,
			t.order,
			t.created_at,
			t.updated_at,
			ts.id AS status_id,
			ts.name AS status_name,
			ts."order" AS status_order
		FROM tasks t
		JOIN task_statuses ts ON t.status_id = ts.id
		WHERE t.id = $1`

	var task models.Task
	var statusID int32
	var statusName string
	var statusOrder int32

	err := r.pool.QueryRow(ctx, query, taskID).Scan(
		&task.ID,
		&task.Title,
		&task.Description,
		&task.StatusID,
		&task.PriorityID,
		&task.TypeID,
		&task.Order,
		&task.CreatedAt,
		&task.UpdatedAt,
		&statusID,
		&statusName,
		&statusOrder,
	)
	if err != nil {
		return nil, fmt.Errorf("error getting task with status: %v", err)
	}

	task.Status = &models.TaskStatusEntity{
		ID:           statusID,
		Name:         statusName,
		DisplayOrder: statusOrder,
	}

	return &task, nil
}

// ClearTasks deletes all tasks (for testing purposes only)
func (r *TaskRepository) ClearTasks(ctx context.Context) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM tasks`)
	if err != nil {
		return fmt.Errorf("error clearing tasks: %v", err)
	}
	return nil
}

// ListTasks returns a list of tasks with optional filtering
func (r *TaskRepository) ListTasks(ctx context.Context, status string, priority string) ([]models.Task, error) {
	log.Printf("Starting ListTasks with status=%v, priority=%v", status, priority)
	
	// Build the query dynamically based on filters
	query := `
		WITH task_list AS (
			SELECT 
				t.id,
				t.title,
				t.description,
				t.status_id,
				t.priority_id,
				t.type_id,
				t."order",
				COALESCE(t.task_content, '{"description":"","acceptance_criteria":[]}'::jsonb) as task_content,
				COALESCE(t.relationships, '{"parent":null,"dependencies":[],"labels":[]}'::jsonb) as relationships,
				COALESCE(t.metadata, '{"created_at":null,"updated_at":null,"board":null,"column":null}'::jsonb) as metadata,
				COALESCE(t.progress, '{"acceptance_criteria":{"total":0,"completed":0},"percentage":0}'::jsonb) as progress,
				t.created_at,
				t.updated_at,
				t.deleted_at
			FROM tasks t
			WHERE t.deleted_at IS NULL
	`

	var args []interface{}
	argPosition := 1

	if status != "" {
		statusID, err := strconv.Atoi(status)
		if err != nil {
			return nil, fmt.Errorf("invalid status ID: %w", err)
		}
		query += fmt.Sprintf(" AND t.status_id = $%d", argPosition)
		args = append(args, int32(statusID))
		argPosition++
	}

	if priority != "" {
		priorityID, err := strconv.Atoi(priority)
		if err != nil {
			return nil, fmt.Errorf("invalid priority ID: %w", err)
		}
		query += fmt.Sprintf(" AND t.priority_id = $%d", argPosition)
		args = append(args, int32(priorityID))
		argPosition++
	}

	query += `
		ORDER BY t."order", t.created_at DESC
	)
	SELECT 
		tl.id,
		tl.title,
		tl.description,
		tl.status_id,
		tl.priority_id,
		tl.type_id,
		tl."order",
		tl.task_content,
		tl.relationships,
		tl.metadata,
		tl.progress,
		tl.created_at,
		tl.updated_at,
		ts.name AS status_name,
		ts."order" AS status_order,
		tl.deleted_at
	FROM task_list tl
	LEFT JOIN task_statuses ts ON tl.status_id = ts.id
	`

	log.Printf("Executing query: %s", query)
	log.Printf("Query args: %v", args)
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return nil, fmt.Errorf("error listing tasks: %v", err)
	}
	defer rows.Close()

	tasks := make([]models.Task, 0)
	rowCount := 0
	for rows.Next() {
		rowCount++
		var task models.Task
		var taskContent, relationships, metadata, progress []byte
		var statusName sql.NullString
		var statusOrder sql.NullInt32
		var deletedAt sql.NullTime

		err := rows.Scan(
			&task.ID,
			&task.Title,
			&task.Description,
			&task.StatusID,
			&task.PriorityID,
			&task.TypeID,
			&task.Order,
			&taskContent,
			&relationships,
			&metadata,
			&progress,
			&task.CreatedAt,
			&task.UpdatedAt,
			&statusName,
			&statusOrder,
			&deletedAt,
		)
		if err != nil {
			log.Printf("Error scanning task row: %v", err)
			return nil, fmt.Errorf("error scanning task: %v", err)
		}

		log.Printf("Scanned task: ID=%s, Title=%s, StatusID=%d", task.ID, task.Title, task.StatusID)
		log.Printf("Task content bytes: %s", string(taskContent))

		// Initialize task fields with default values
		task.Content = &models.TaskContent{
			Description:        task.Description,
			AcceptanceCriteria: make([]models.AcceptanceCriterion, 0),
		}
		task.Relationships = models.TaskRelationships{
			Parent:       nil,
			Dependencies: make([]string, 0),
			Labels:      make([]string, 0),
		}
		task.Progress = models.TaskProgress{
			AcceptanceCriteria: models.AcceptanceCriteriaProgress{
				Total:     0,
				Completed: 0,
			},
			Percentage: 0,
		}
		task.Metadata = models.TaskMetadata{}

		// Parse JSONB fields
		if len(taskContent) > 0 {
			if err := json.Unmarshal(taskContent, &task.Content); err != nil {
				log.Printf("Error unmarshaling task_content: %v, content: %s", err, string(taskContent))
				// Don't skip the task, just use the default content
			}
		}

		if len(relationships) > 0 {
			if err := json.Unmarshal(relationships, &task.Relationships); err != nil {
				log.Printf("Error unmarshaling relationships: %v", err)
				// Don't skip the task, just use the default relationships
			}
		}

		if len(metadata) > 0 {
			if err := json.Unmarshal(metadata, &task.Metadata); err != nil {
				log.Printf("Error unmarshaling metadata: %v", err)
				// Don't skip the task, just use the default metadata
			}
		}

		if len(progress) > 0 {
			if err := json.Unmarshal(progress, &task.Progress); err != nil {
				log.Printf("Error unmarshaling progress: %v", err)
				// Don't skip the task, just use the default progress
			}
		}

		if statusName.Valid && statusOrder.Valid {
			task.Status = &models.TaskStatusEntity{
				ID:           task.StatusID,
				Name:         statusName.String,
				DisplayOrder: int32(statusOrder.Int32),
			}
		}

		tasks = append(tasks, task)
		log.Printf("Added task to list: ID=%s, Title=%s", task.ID, task.Title)
	}

	if err = rows.Err(); err != nil {
		log.Printf("Error iterating rows: %v", err)
		return nil, fmt.Errorf("error iterating tasks: %v", err)
	}

	log.Printf("Processed %d rows, returning %d tasks", rowCount, len(tasks))
	return tasks, nil
}

// GetTask retrieves a task by ID
func (r *TaskRepository) GetTask(ctx context.Context, taskID string) (*models.Task, error) {
	var task models.Task
	err := r.pool.QueryRow(ctx, `
		SELECT 
			t.id,
			t.title,
			t.description,
			t.status_id,
			t.priority_id,
			t.type_id,
			t.order,
			t.created_at,
			t.updated_at
		FROM tasks t
		WHERE t.id = $1
	`, taskID).Scan(
		&task.ID,
		&task.Title,
		&task.Description,
		&task.StatusID,
		&task.PriorityID,
		&task.TypeID,
		&task.Order,
		&task.CreatedAt,
		&task.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("error getting task: %v", err)
	}
	return &task, nil
}

// CreateTask creates a new task
func (r *TaskRepository) CreateTask(ctx context.Context, task *models.Task) error {
	// Start a transaction with serializable isolation level
	tx, err := r.pool.BeginTx(ctx, pgx.TxOptions{
		IsoLevel: pgx.Serializable,
	})
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Get the current maximum order value
	var maxOrder *int32
	err = tx.QueryRow(ctx, `
		SELECT MAX("order")
		FROM tasks
		WHERE status_id = $1
		AND deleted_at IS NULL
	`, task.StatusID).Scan(&maxOrder)
	if err != nil {
		return fmt.Errorf("error getting max order: %v", err)
	}

	// Lock the tasks table for this status to prevent race conditions
	_, err = tx.Exec(ctx, `
		SELECT 1
		FROM tasks
		WHERE status_id = $1
		AND deleted_at IS NULL
		FOR UPDATE
	`, task.StatusID)
	if err != nil {
		return fmt.Errorf("error locking tasks: %v", err)
	}

	// Calculate the next order value
	if maxOrder == nil {
		task.Order = 0
	} else {
		task.Order = *maxOrder + 1
	}

	// Initialize task fields if they are nil
	if task.Content == nil {
		task.Content = &models.TaskContent{
			Description:        task.Description,
			AcceptanceCriteria: make([]models.AcceptanceCriterion, 0),
		}
	}
	if task.Relationships.Labels == nil {
		task.Relationships.Labels = make([]string, 0)
	}
	if task.Relationships.Dependencies == nil {
		task.Relationships.Dependencies = make([]string, 0)
	}
	if task.Progress.AcceptanceCriteria.Total == 0 {
		task.Progress.AcceptanceCriteria.Total = len(task.Content.AcceptanceCriteria)
	}

	// Insert the task
	err = tx.QueryRow(ctx, `
		WITH task_insert AS (
			INSERT INTO tasks (
				title, description, status_id, priority_id, type_id, 
				"order", task_content, relationships, metadata, progress,
				created_at, updated_at, deleted_at
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NULL)
			RETURNING id, created_at, updated_at
		)
		SELECT id, created_at, updated_at FROM task_insert
	`,
		task.Title,
		task.Description,
		task.StatusID,
		task.PriorityID,
		task.TypeID,
		task.Order,
		task.Content,
		task.Relationships,
		task.Metadata,
		task.Progress,
	).Scan(&task.ID, &task.CreatedAt, &task.UpdatedAt)

	if err != nil {
		return fmt.Errorf("error creating task: %v", err)
	}

	// Commit the transaction
	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	return nil
}

func (r *TaskRepository) UpdateTask(ctx context.Context, taskID string, task *models.Task) error {
	// Start a transaction
	tx, err := r.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// If type_id is not set, get the default task type
	if task.TypeID == 0 {
		defaultType, err := r.GetDefaultTaskType(ctx)
		if err != nil {
			return fmt.Errorf("failed to get default task type: %v", err)
		}
		task.TypeID = defaultType.ID
	} else {
		// Verify type_id exists
		var typeExists bool
		err = tx.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM task_types WHERE id = $1)", task.TypeID).Scan(&typeExists)
		if err != nil {
			return fmt.Errorf("error checking type_id existence: %v", err)
		}
		if !typeExists {
			return fmt.Errorf("type_id %d does not exist in task_types table", task.TypeID)
		}
	}

	// Marshal JSON fields
	taskContent, err := json.Marshal(task.Content)
	if err != nil {
		return fmt.Errorf("error marshaling task content: %v", err)
	}

	relationships, err := json.Marshal(task.Relationships)
	if err != nil {
		return fmt.Errorf("error marshaling relationships: %v", err)
	}

	metadata, err := json.Marshal(task.Metadata)
	if err != nil {
		return fmt.Errorf("error marshaling metadata: %v", err)
	}

	progress, err := json.Marshal(task.Progress)
	if err != nil {
		return fmt.Errorf("error marshaling progress: %v", err)
	}

	result, err := tx.Exec(ctx, `
		UPDATE tasks
		SET title = $1,
			description = $2,
			status_id = $3,
			priority_id = $4,
			type_id = $5,
			"order" = $6,
			task_content = $7,
			relationships = $8,
			metadata = $9,
			progress = $10,
			updated_at = NOW()
		WHERE id = $11
	`,
		task.Title,
		task.Description,
		task.StatusID,
		task.PriorityID,
		task.TypeID,
		task.Order,
		taskContent,
		relationships,
		metadata,
		progress,
		taskID,
	)
	if err != nil {
		return fmt.Errorf("error updating task: %v", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("task not found: %s", taskID)
	}

	return nil
}

// DeleteTask deletes a task by ID
func (r *TaskRepository) DeleteTask(ctx context.Context, taskID string) error {
	result, err := r.pool.Exec(ctx, "DELETE FROM tasks WHERE id = $1", taskID)
	if err != nil {
		return fmt.Errorf("error deleting task: %v", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("task not found: %s", taskID)
	}

	return nil
}

// GetDependentTasks gets the number of tasks that depend on the given task
func (r *TaskRepository) GetDependentTasks(ctx context.Context, taskID string) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM task_dependencies
		WHERE dependency_id = $1
	`, taskID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("error getting dependent tasks: %v", err)
	}
	return count, nil
}

// ListTaskStatuses returns a list of all task statuses
func (r *TaskRepository) ListTaskStatuses(ctx context.Context) ([]models.TaskStatus, error) {
	query := `
		SELECT id, name, "order"
		FROM task_statuses
		ORDER BY "order"
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error listing task statuses: %v", err)
	}
	defer rows.Close()

	var statuses []models.TaskStatus
	for rows.Next() {
		var status models.TaskStatus
		err := rows.Scan(
			&status.ID,
			&status.Name,
			&status.DisplayOrder,
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
func (r *TaskRepository) ListTaskPriorities(ctx context.Context) ([]models.TaskPriorityEntity, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, display_order
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

// GetDefaultTaskType returns the default task type (lowest display_order)
func (r *TaskRepository) GetDefaultTaskType(ctx context.Context) (*models.TaskTypeEntity, error) {
	// First try to get the feature type as default
	var taskType models.TaskTypeEntity
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
		if err := r.initializeDefaultTaskTypes(ctx); err != nil {
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

// initializeDefaultTaskTypes creates the default task types if they don't exist
func (r *TaskRepository) initializeDefaultTaskTypes(ctx context.Context) error {
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

// ListTaskTypes returns a list of all task types
func (r *TaskRepository) ListTaskTypes(ctx context.Context) ([]models.TaskTypeEntity, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, code, name, description, display_order, created_at, updated_at
		FROM task_types
		ORDER BY display_order ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("error listing task types: %v", err)
	}
	defer rows.Close()

	var types []models.TaskTypeEntity
	for rows.Next() {
		var t models.TaskTypeEntity
		err := rows.Scan(&t.ID, &t.Code, &t.Name, &t.Description, &t.DisplayOrder, &t.CreatedAt, &t.UpdatedAt)
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
	return r.pool.Begin(ctx)
}

// Ping checks if the database connection is alive
func (r *TaskRepository) Ping(ctx context.Context) error {
	return r.pool.Ping(ctx)
}

// TaskFilters represents the filters that can be applied to task queries
type TaskFilters struct {
	Status   int32
	Priority int32
	Type     int32
}

// taskRow represents a row returned from the task query
type taskRow struct {
	ID            string
	Title         string
	Description   string
	StatusID      int32
	PriorityID    int32
	TypeID        int32
	Order         int32
	Content       []byte
	Relationships []byte
	Metadata      []byte
	Progress      []byte
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     sql.NullTime
	StatusName    sql.NullString
	StatusOrder   sql.NullInt32
	PriorityName  sql.NullString
	PriorityOrder sql.NullInt32
	TypeName      sql.NullString
	TypeOrder     sql.NullInt32
}

// GetTasks retrieves tasks based on the provided filters
func (r *TaskRepository) GetTasks(ctx context.Context, filters TaskFilters) ([]models.Task, error) {
	query := `
		SELECT 
			t.id,
			t.title,
			t.description,
			t.status_id,
			t.priority_id,
			t.type_id,
			t."order",
			t.task_content,
			t.relationships,
			t.metadata,
			t.progress,
			t.created_at,
			t.updated_at,
			t.deleted_at,
			ts.name as status_name,
			ts."order" as status_display_order,
			tp.name as priority_name,
			tp.display_order as priority_display_order,
			tt.name as type_name,
			tt.display_order as type_display_order
		FROM tasks t
		LEFT JOIN task_statuses ts ON t.status_id = ts.id
		LEFT JOIN task_priorities tp ON t.priority_id = tp.id
		LEFT JOIN task_types tt ON t.type_id = tt.id
		WHERE t.deleted_at IS NULL
	`

	var conditions []string
	var args []interface{}
	paramCount := 1

	if filters.Status != 0 {
		conditions = append(conditions, fmt.Sprintf("t.status_id = $%d", paramCount))
		args = append(args, filters.Status)
		paramCount++
	}

	if filters.Priority != 0 {
		conditions = append(conditions, fmt.Sprintf("t.priority_id = $%d", paramCount))
		args = append(args, filters.Priority)
		paramCount++
	}

	if filters.Type != 0 {
		conditions = append(conditions, fmt.Sprintf("t.type_id = $%d", paramCount))
		args = append(args, filters.Type)
		paramCount++
	}

	if len(conditions) > 0 {
		query += " AND " + strings.Join(conditions, " AND ")
	}

	query += ` ORDER BY t."order", t.created_at DESC`

	// Execute the query
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error getting tasks: %w", err)
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		var content, relationships, metadata, progress []byte
		var statusName, priorityName, typeName sql.NullString
		var statusOrder, priorityOrder, typeOrder sql.NullInt32
		var deletedAt sql.NullTime

		err := rows.Scan(
			&task.ID,
			&task.Title,
			&task.Description,
			&task.StatusID,
			&task.PriorityID,
			&task.TypeID,
			&task.Order,
			&content,
			&relationships,
			&metadata,
			&progress,
			&task.CreatedAt,
			&task.UpdatedAt,
			&deletedAt,
			&statusName,
			&statusOrder,
			&priorityName,
			&priorityOrder,
			&typeName,
			&typeOrder,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning task row: %w", err)
		}

		// Initialize default values
		task.Content = &models.TaskContent{
			Description:        task.Description,
			AcceptanceCriteria: make([]models.AcceptanceCriterion, 0),
		}
		task.Relationships = models.TaskRelationships{
			Parent:       nil,
			Dependencies: make([]string, 0),
			Labels:      make([]string, 0),
		}
		task.Progress = models.TaskProgress{
			AcceptanceCriteria: models.AcceptanceCriteriaProgress{
				Total:     0,
				Completed: 0,
			},
			Percentage: 0,
		}
		task.Metadata = models.TaskMetadata{}

		// Parse JSONB fields if they exist
		if len(content) > 0 {
			_ = json.Unmarshal(content, &task.Content)
		}
		if len(relationships) > 0 {
			_ = json.Unmarshal(relationships, &task.Relationships)
		}
		if len(metadata) > 0 {
			_ = json.Unmarshal(metadata, &task.Metadata)
		}
		if len(progress) > 0 {
			_ = json.Unmarshal(progress, &task.Progress)
		}

		// Set related entities if they exist
		if statusName.Valid && statusOrder.Valid {
			task.Status = &models.TaskStatusEntity{
				ID:           task.StatusID,
				Name:         statusName.String,
				DisplayOrder: int32(statusOrder.Int32),
			}
		}
		if priorityName.Valid && priorityOrder.Valid {
			task.Priority = &models.TaskPriorityEntity{
				ID:           task.PriorityID,
				Name:         priorityName.String,
				DisplayOrder: int32(priorityOrder.Int32),
			}
		}
		if typeName.Valid && typeOrder.Valid {
			task.Type = &models.TaskTypeEntity{
				ID:           task.TypeID,
				Name:         typeName.String,
				DisplayOrder: int32(typeOrder.Int32),
			}
		}

		tasks = append(tasks, task)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating tasks: %w", err)
	}

	return tasks, nil
}