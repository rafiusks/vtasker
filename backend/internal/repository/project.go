package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/vtasker/internal/models"
)

var (
	ErrProjectNotFound = errors.New("project not found")
)

// ProjectRepository defines the interface for project database operations
type ProjectRepository interface {
	Create(ctx context.Context, project *models.Project) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Project, error)
	List(ctx context.Context, page, pageSize int, filters map[string]interface{}) ([]models.Project, int64, error)
	Update(ctx context.Context, project *models.Project) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetProjectStats(ctx context.Context, id uuid.UUID) (issueCount, openIssueCount int, err error)
}

// PostgresProjectRepository implements ProjectRepository for PostgreSQL
type PostgresProjectRepository struct {
	db *sql.DB
}

// NewProjectRepository creates a new PostgreSQL project repository
func NewProjectRepository(db *sql.DB) ProjectRepository {
	return &PostgresProjectRepository{db: db}
}

// Create inserts a new project into the database
func (r *PostgresProjectRepository) Create(ctx context.Context, project *models.Project) error {
	query := `
		INSERT INTO projects (id, name, description, created_by, is_archived, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.ExecContext(ctx, query,
		project.ID,
		project.Name,
		project.Description,
		project.CreatedBy,
		project.IsArchived,
		project.CreatedAt,
		project.UpdatedAt,
	)
	return err
}

// GetByID retrieves a project by its ID
func (r *PostgresProjectRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Project, error) {
	query := `
		SELECT id, name, description, created_by, is_archived, created_at, updated_at
		FROM projects
		WHERE id = $1 AND is_archived = false
	`
	project := &models.Project{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&project.ID,
		&project.Name,
		&project.Description,
		&project.CreatedBy,
		&project.IsArchived,
		&project.CreatedAt,
		&project.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, ErrProjectNotFound
	}
	if err != nil {
		return nil, err
	}
	return project, nil
}

// List retrieves a paginated list of projects with optional filters
func (r *PostgresProjectRepository) List(ctx context.Context, page, pageSize int, filters map[string]interface{}) ([]models.Project, int64, error) {
	offset := (page - 1) * pageSize

	// Base query
	query := `
		SELECT id, name, description, created_by, is_archived, created_at, updated_at
		FROM projects
		WHERE is_archived = false
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	// Count query
	countQuery := `
		SELECT COUNT(*)
		FROM projects
		WHERE is_archived = false
	`

	// Execute count query
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Execute main query
	rows, err := r.db.QueryContext(ctx, query, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var project models.Project
		err := rows.Scan(
			&project.ID,
			&project.Name,
			&project.Description,
			&project.CreatedBy,
			&project.IsArchived,
			&project.CreatedAt,
			&project.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		projects = append(projects, project)
	}

	return projects, total, rows.Err()
}

// Update updates an existing project
func (r *PostgresProjectRepository) Update(ctx context.Context, project *models.Project) error {
	query := `
		UPDATE projects
		SET name = $1, description = $2, is_archived = $3, updated_at = $4
		WHERE id = $5
	`
	result, err := r.db.ExecContext(ctx, query,
		project.Name,
		project.Description,
		project.IsArchived,
		project.UpdatedAt,
		project.ID,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrProjectNotFound
	}

	return nil
}

// Delete soft deletes a project by setting is_archived to true
func (r *PostgresProjectRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE projects
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
		return ErrProjectNotFound
	}

	return nil
}

// GetProjectStats retrieves issue statistics for a project
func (r *PostgresProjectRepository) GetProjectStats(ctx context.Context, id uuid.UUID) (issueCount, openIssueCount int, err error) {
	query := `
		SELECT
			COUNT(*),
			COUNT(*) FILTER (WHERE status != 'done')
		FROM issues
		WHERE project_id = $1 AND is_archived = false
	`
	err = r.db.QueryRowContext(ctx, query, id).Scan(&issueCount, &openIssueCount)
	return
} 