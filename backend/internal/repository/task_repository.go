package repository

import (
	"context"
	"database/sql"
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
	BoardID  *uuid.UUID
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
	var contentDescription, implementationDetails, notes sql.NullString
	var attachments []byte
	var dueDate sql.NullTime
	var assignee sql.NullString

	query := `
		SELECT 
			t.id, 
			t.title,
			t.description,
			t.status_id,
			t.priority_id,
			t.type_id,
			t.owner_id,
			t.parent_id,
			t.order_index,
			t.created_at,
			t.updated_at,
			tc.description as content_description,
			tc.implementation_details,
			tc.notes,
			tc.attachments,
			tc.due_date,
			tc.assignee
		FROM tasks t
		LEFT JOIN task_contents tc ON t.id = tc.task_id
		WHERE t.id = $1`

	err := r.db.QueryRow(ctx, query, id).Scan(
		&task.ID,
		&task.Title,
		&task.Description,
		&task.StatusID,
		&task.PriorityID,
		&task.TypeID,
		&task.OwnerID,
		&task.ParentID,
		&task.OrderIndex,
		&task.CreatedAt,
		&task.UpdatedAt,
		&contentDescription,
		&implementationDetails,
		&notes,
		&attachments,
		&dueDate,
		&assignee,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("task not found")
		}
		log.Printf("Error querying task: %v", err)
		return nil, fmt.Errorf("error getting task: %v", err)
	}

	// Set content fields
	task.Content = models.TaskContent{
		Description: contentDescription.String,
		ImplementationDetails: implementationDetails.String,
		Notes: notes.String,
		AcceptanceCriteria: make([]models.AcceptanceCriterion, 0),
	}

	// Parse attachments JSON if present
	if len(attachments) > 0 {
		if err := json.Unmarshal(attachments, &task.Content.Attachments); err != nil {
			return nil, fmt.Errorf("error unmarshaling attachments: %v", err)
		}
	}

	if dueDate.Valid {
		task.Content.DueDate = &dueDate.Time
	}

	if assignee.Valid {
		assigneeUUID, err := uuid.Parse(assignee.String)
		if err != nil {
			return nil, fmt.Errorf("error parsing assignee UUID: %v", err)
		}
		task.Content.Assignee = &assigneeUUID
	}

	// Get acceptance criteria
	acQuery := `
		SELECT 
			id,
			description,
			completed,
			completed_at,
			completed_by,
			order_index,
			category,
			notes,
			created_at,
			updated_at
		FROM acceptance_criteria
		WHERE task_id = $1
		ORDER BY order_index`

	acRows, err := r.db.Query(ctx, acQuery, task.ID)
	if err != nil {
		return nil, fmt.Errorf("error querying acceptance criteria: %v", err)
	}
	defer acRows.Close()

	for acRows.Next() {
		var ac models.AcceptanceCriterion
		var category, notes sql.NullString
		var completedAt sql.NullTime
		var completedBy sql.NullString

		err := acRows.Scan(
			&ac.ID,
			&ac.Description,
			&ac.Completed,
			&completedAt,
			&completedBy,
			&ac.Order,
			&category,
			&notes,
			&ac.CreatedAt,
			&ac.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning acceptance criterion row: %v", err)
		}

		if category.Valid {
			ac.Category = &category.String
		}
		if notes.Valid {
			ac.Notes = &notes.String
		}
		if completedAt.Valid {
			ac.CompletedAt = &completedAt.Time
		}
		if completedBy.Valid {
			completedByUUID, err := uuid.Parse(completedBy.String)
			if err != nil {
				return nil, fmt.Errorf("error parsing completed_by UUID: %v", err)
			}
			ac.CompletedBy = &completedByUUID
		}

		task.Content.AcceptanceCriteria = append(task.Content.AcceptanceCriteria, ac)
	}

	if err = acRows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating acceptance criteria rows: %v", err)
	}

	return &task, nil
}

// CreateTask creates a new task
func (r *TaskRepository) CreateTask(ctx context.Context, input *models.CreateTaskInput, userID uuid.UUID) (*models.Task, error) {
	task := models.NewTask(*input, userID)

	// Start transaction
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Create task
	query := `
		INSERT INTO tasks (
			id, 
			title,
			description,
			status_id,
			priority_id,
			type_id,
			owner_id,
			board_id,
			order_index,
			created_at,
			updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id`

	err = tx.QueryRow(ctx, query,
		task.ID,
		task.Title,
		task.Description,
		task.StatusID,
		task.PriorityID,
		task.TypeID,
		task.OwnerID,
		task.BoardID,
		task.OrderIndex,
		task.CreatedAt,
		task.UpdatedAt,
	).Scan(&task.ID)

	if err != nil {
		return nil, fmt.Errorf("error creating task: %v", err)
	}

	// Create task content
	contentQuery := `
		INSERT INTO task_contents (
			task_id,
			description,
			implementation_details,
			notes,
			attachments,
			due_date,
			assignee,
			created_at,
			updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	attachmentsJSON, err := json.Marshal(input.Content.Attachments)
	if err != nil {
		return nil, fmt.Errorf("error marshaling attachments: %v", err)
	}

	_, err = tx.Exec(ctx, contentQuery,
		task.ID,
		input.Content.Description,
		input.Content.ImplementationDetails,
		input.Content.Notes,
		attachmentsJSON,
		input.Content.DueDate,
		input.Content.Assignee,
		task.CreatedAt,
		task.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("error creating task content: %v", err)
	}

	// Create acceptance criteria if provided
	if len(input.Content.AcceptanceCriteria) > 0 {
		acQuery := `
			INSERT INTO acceptance_criteria (
				id,
				task_id,
				description,
				completed,
				order_index,
				category,
				notes,
				created_at,
				updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

		for _, ac := range input.Content.AcceptanceCriteria {
			_, err = tx.Exec(ctx, acQuery,
				uuid.New(),
				task.ID,
				ac.Description,
				false,
				ac.Order,
				ac.Category,
				ac.Notes,
				task.CreatedAt,
				task.UpdatedAt,
			)
			if err != nil {
				return nil, fmt.Errorf("error creating acceptance criterion: %v", err)
			}
		}
	}

	// Commit transaction
	if err = tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("error committing transaction: %v", err)
	}

	return r.GetTask(ctx, task.ID.String())
}

// UpdateTask updates an existing task
func (r *TaskRepository) UpdateTask(ctx context.Context, id string, input *models.UpdateTaskInput, userID uuid.UUID) (*models.Task, error) {
	task, err := r.GetTask(ctx, id)
	if err != nil {
		return nil, err
	}

	// Check if user has permission to update the task
	if !task.CanUserEdit(userID) {
		return nil, fmt.Errorf("user does not have permission to update this task")
	}

	// Update fields if provided in input
	if input.Title != nil {
		task.Title = *input.Title
	}
	if input.Description != nil {
		task.Description = *input.Description
	}
	if input.StatusID != nil {
		task.StatusID = *input.StatusID
	}
	if input.PriorityID != nil {
		task.PriorityID = *input.PriorityID
	}
	if input.TypeID != nil {
		task.TypeID = *input.TypeID
	}
	if input.BoardID != nil {
		task.BoardID = input.BoardID
	}

	// Start transaction
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Update task
	query := `
		UPDATE tasks 
		SET 
			title = $1,
			description = $2,
			status_id = $3,
			priority_id = $4,
			type_id = $5,
			board_id = $6,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $7`

	_, err = tx.Exec(ctx, query,
		task.Title,
		task.Description,
		task.StatusID,
		task.PriorityID,
		task.TypeID,
		task.BoardID,
		task.ID,
	)

	if err != nil {
		return nil, fmt.Errorf("error updating task: %v", err)
	}

	// Update task content if provided
	if input.Content != nil {
		contentQuery := `
			INSERT INTO task_contents (
				task_id,
				description,
				implementation_details,
				notes,
				attachments,
				due_date,
				assignee
			) VALUES ($1, $2, $3, $4, $5, $6, $7)
			ON CONFLICT (task_id) DO UPDATE SET
				description = EXCLUDED.description,
				implementation_details = EXCLUDED.implementation_details,
				notes = EXCLUDED.notes,
				attachments = EXCLUDED.attachments,
				due_date = EXCLUDED.due_date,
				assignee = EXCLUDED.assignee,
				updated_at = CURRENT_TIMESTAMP`

		attachmentsJSON, err := json.Marshal(input.Content.Attachments)
		if err != nil {
			return nil, fmt.Errorf("error marshaling attachments: %v", err)
		}

		_, err = tx.Exec(ctx, contentQuery,
			task.ID,
			input.Content.Description,
			input.Content.ImplementationDetails,
			input.Content.Notes,
			attachmentsJSON,
			input.Content.DueDate,
			input.Content.Assignee,
		)

		if err != nil {
			return nil, fmt.Errorf("error updating task content: %v", err)
		}
	}

	// Commit transaction
	if err = tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("error committing transaction: %v", err)
	}

	return r.GetTask(ctx, id)
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
func (r *TaskRepository) GetTasks(ctx context.Context, filters TaskFilters, userID uuid.UUID) ([]*models.Task, error) {
	var tasks []*models.Task

	// First get all tasks with their content
	query := `
		SELECT 
			t.id, 
			t.title,
			t.description,
			t.status_id,
			t.priority_id,
			t.type_id,
			t.owner_id,
			t.parent_id,
			t.board_id,
			t.order_index,
			t.created_at,
			t.updated_at,
			tc.description as content_description,
			tc.implementation_details,
			tc.notes,
			tc.attachments,
			tc.due_date,
			tc.assignee
		FROM tasks t
		LEFT JOIN task_contents tc ON t.id = tc.task_id
		WHERE 1=1`

	args := []interface{}{}
	argNum := 1

	// Add filters
	if filters.Status != "" {
		query += fmt.Sprintf(" AND t.status_id = $%d", argNum)
		args = append(args, filters.Status)
		argNum++
	}
	if filters.Priority != "" {
		query += fmt.Sprintf(" AND t.priority_id = $%d", argNum)
		args = append(args, filters.Priority)
		argNum++
	}
	if filters.Type != "" {
		query += fmt.Sprintf(" AND t.type_id = $%d", argNum)
		args = append(args, filters.Type)
		argNum++
	}
	if filters.BoardID != nil {
		query += fmt.Sprintf(" AND t.board_id = $%d", argNum)
		args = append(args, filters.BoardID)
		argNum++

		// Check board access
		query += fmt.Sprintf(` AND (
			EXISTS (SELECT 1 FROM boards b WHERE b.id = $%d AND (
				b.is_public = true OR
				b.owner_id = $%d OR
				EXISTS (SELECT 1 FROM board_members bm WHERE bm.board_id = b.id AND bm.user_id = $%d)
			))
		)`, argNum, argNum+1, argNum+2)
		args = append(args, filters.BoardID, userID, userID)
		argNum += 3
	} else {
		// If no board specified, only show tasks from boards the user has access to
		query += fmt.Sprintf(` AND (
			t.board_id IS NULL OR
			EXISTS (SELECT 1 FROM boards b WHERE b.id = t.board_id AND (
				b.is_public = true OR
				b.owner_id = $%d OR
				EXISTS (SELECT 1 FROM board_members bm WHERE bm.board_id = b.id AND bm.user_id = $%d)
			))
		)`, argNum, argNum+1)
		args = append(args, userID, userID)
		argNum += 2
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying tasks: %v", err)
	}
	defer rows.Close()

	taskMap := make(map[uuid.UUID]*models.Task)

	for rows.Next() {
		var task models.Task
		var contentDescription, implementationDetails, notes sql.NullString
		var attachments []byte
		var dueDate sql.NullTime
		var assignee sql.NullString

		err := rows.Scan(
			&task.ID,
			&task.Title,
			&task.Description,
			&task.StatusID,
			&task.PriorityID,
			&task.TypeID,
			&task.OwnerID,
			&task.ParentID,
			&task.BoardID,
			&task.OrderIndex,
			&task.CreatedAt,
			&task.UpdatedAt,
			&contentDescription,
			&implementationDetails,
			&notes,
			&attachments,
			&dueDate,
			&assignee,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning task row: %v", err)
		}

		// Set content fields
		task.Content = models.TaskContent{
			Description: contentDescription.String,
			ImplementationDetails: implementationDetails.String,
			Notes: notes.String,
			AcceptanceCriteria: make([]models.AcceptanceCriterion, 0),
		}

		// Parse attachments JSON if present
		if len(attachments) > 0 {
			if err := json.Unmarshal(attachments, &task.Content.Attachments); err != nil {
				return nil, fmt.Errorf("error unmarshaling attachments: %v", err)
			}
		}

		if dueDate.Valid {
			task.Content.DueDate = &dueDate.Time
		}

		if assignee.Valid {
			assigneeUUID, err := uuid.Parse(assignee.String)
			if err != nil {
				return nil, fmt.Errorf("error parsing assignee UUID: %v", err)
			}
			task.Content.Assignee = &assigneeUUID
		}

		taskMap[task.ID] = &task
		tasks = append(tasks, &task)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating task rows: %v", err)
	}

	// Get acceptance criteria for all tasks
	if len(tasks) > 0 {
		acQuery := `
			SELECT 
				id,
				task_id,
				description,
				completed,
				completed_at,
				completed_by,
				order_index,
				category,
				notes,
				created_at,
				updated_at
			FROM acceptance_criteria
			WHERE task_id = ANY($1)
			ORDER BY task_id, order_index`

		taskIDs := make([]uuid.UUID, len(tasks))
		for i, task := range tasks {
			taskIDs[i] = task.ID
		}

		acRows, err := r.db.Query(ctx, acQuery, taskIDs)
		if err != nil {
			return nil, fmt.Errorf("error querying acceptance criteria: %v", err)
		}
		defer acRows.Close()

		for acRows.Next() {
			var ac models.AcceptanceCriterion
			var taskID uuid.UUID
			var category, notes sql.NullString
			var completedAt sql.NullTime
			var completedBy sql.NullString

			err := acRows.Scan(
				&ac.ID,
				&taskID,
				&ac.Description,
				&ac.Completed,
				&completedAt,
				&completedBy,
				&ac.Order,
				&category,
				&notes,
				&ac.CreatedAt,
				&ac.UpdatedAt,
			)
			if err != nil {
				return nil, fmt.Errorf("error scanning acceptance criterion row: %v", err)
			}

			if category.Valid {
				ac.Category = &category.String
			}
			if notes.Valid {
				ac.Notes = &notes.String
			}
			if completedAt.Valid {
				ac.CompletedAt = &completedAt.Time
			}
			if completedBy.Valid {
				completedByUUID, err := uuid.Parse(completedBy.String)
				if err != nil {
					return nil, fmt.Errorf("error parsing completed_by UUID: %v", err)
				}
				ac.CompletedBy = &completedByUUID
			}

			if task, ok := taskMap[taskID]; ok {
				task.Content.AcceptanceCriteria = append(task.Content.AcceptanceCriteria, ac)
			}
		}

		if err = acRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating acceptance criteria rows: %v", err)
		}
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