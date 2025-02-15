package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/vtasker/internal/models"
)

var (
	ErrIssueNotFound = errors.New("issue not found")
)

// IssueRepository defines the interface for issue database operations
type IssueRepository interface {
	Create(ctx context.Context, issue *models.Issue) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Issue, error)
	List(ctx context.Context, page, pageSize int, filter *models.IssueFilter) ([]models.Issue, int64, error)
	Update(ctx context.Context, issue *models.Issue) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// PostgresIssueRepository implements IssueRepository for PostgreSQL
type PostgresIssueRepository struct {
	db *sql.DB
}

// NewIssueRepository creates a new PostgreSQL issue repository
func NewIssueRepository(db *sql.DB) IssueRepository {
	return &PostgresIssueRepository{db: db}
}

// Create inserts a new issue into the database
func (r *PostgresIssueRepository) Create(ctx context.Context, issue *models.Issue) error {
	query := `
		INSERT INTO issues (
			id, title, description, status, priority, project_id, assignee_id,
			created_by, is_archived, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.db.ExecContext(ctx, query,
		issue.ID,
		issue.Title,
		issue.Description,
		issue.Status,
		issue.Priority,
		issue.ProjectID,
		issue.AssigneeID,
		issue.CreatedBy,
		issue.IsArchived,
		issue.CreatedAt,
		issue.UpdatedAt,
	)
	return err
}

// GetByID retrieves an issue by its ID
func (r *PostgresIssueRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Issue, error) {
	query := `
		SELECT id, title, description, status, priority, project_id, assignee_id,
			created_by, is_archived, created_at, updated_at
		FROM issues
		WHERE id = $1 AND is_archived = false
	`
	issue := &models.Issue{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&issue.ID,
		&issue.Title,
		&issue.Description,
		&issue.Status,
		&issue.Priority,
		&issue.ProjectID,
		&issue.AssigneeID,
		&issue.CreatedBy,
		&issue.IsArchived,
		&issue.CreatedAt,
		&issue.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, ErrIssueNotFound
	}
	if err != nil {
		return nil, err
	}
	return issue, nil
}

// List retrieves a paginated list of issues with optional filters
func (r *PostgresIssueRepository) List(ctx context.Context, page, pageSize int, filter *models.IssueFilter) ([]models.Issue, int64, error) {
	offset := (page - 1) * pageSize

	// Build the WHERE clause based on filters
	var conditions []string
	var args []interface{}
	argCount := 1

	conditions = append(conditions, "is_archived = false")

	if filter != nil {
		if filter.ProjectID != nil {
			conditions = append(conditions, fmt.Sprintf("project_id = $%d", argCount))
			args = append(args, *filter.ProjectID)
			argCount++
		}
		if filter.Status != nil {
			conditions = append(conditions, fmt.Sprintf("status = $%d", argCount))
			args = append(args, *filter.Status)
			argCount++
		}
		if filter.Priority != nil {
			conditions = append(conditions, fmt.Sprintf("priority = $%d", argCount))
			args = append(args, *filter.Priority)
			argCount++
		}
		if filter.AssigneeID != nil {
			conditions = append(conditions, fmt.Sprintf("assignee_id = $%d", argCount))
			args = append(args, *filter.AssigneeID)
			argCount++
		}
		if filter.Search != nil {
			conditions = append(conditions, fmt.Sprintf("(title ILIKE $%d OR description ILIKE $%d)", argCount, argCount))
			args = append(args, "%"+*filter.Search+"%")
			argCount++
		}
	}

	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	// Build the main query
	query := fmt.Sprintf(`
		SELECT id, title, description, status, priority, project_id, assignee_id,
			created_by, is_archived, created_at, updated_at
		FROM issues
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argCount, argCount+1)

	// Add pagination parameters
	args = append(args, pageSize, offset)

	// Execute main query
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var issues []models.Issue
	for rows.Next() {
		var issue models.Issue
		err := rows.Scan(
			&issue.ID,
			&issue.Title,
			&issue.Description,
			&issue.Status,
			&issue.Priority,
			&issue.ProjectID,
			&issue.AssigneeID,
			&issue.CreatedBy,
			&issue.IsArchived,
			&issue.CreatedAt,
			&issue.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		issues = append(issues, issue)
	}

	// Count total matching issues
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM issues
		%s
	`, whereClause)

	var total int64
	err = r.db.QueryRowContext(ctx, countQuery, args[:len(args)-2]...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	return issues, total, rows.Err()
}

// Update updates an existing issue
func (r *PostgresIssueRepository) Update(ctx context.Context, issue *models.Issue) error {
	query := `
		UPDATE issues
		SET title = $1, description = $2, status = $3, priority = $4,
			assignee_id = $5, is_archived = $6, updated_at = $7
		WHERE id = $8
	`
	result, err := r.db.ExecContext(ctx, query,
		issue.Title,
		issue.Description,
		issue.Status,
		issue.Priority,
		issue.AssigneeID,
		issue.IsArchived,
		issue.UpdatedAt,
		issue.ID,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrIssueNotFound
	}

	return nil
}

// Delete soft deletes an issue by setting is_archived to true
func (r *PostgresIssueRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE issues
		SET is_archived = true, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
	`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrIssueNotFound
	}

	return nil
} 