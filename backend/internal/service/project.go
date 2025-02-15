package service

import (
	"context"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/vtasker/internal/models"
	"github.com/vtasker/internal/repository"
	"github.com/vtasker/pkg/logger"
)

// ProjectService handles business logic for projects
type ProjectService struct {
	repo     repository.ProjectRepository
	validate *validator.Validate
}

// NewProjectService creates a new project service
func NewProjectService(repo repository.ProjectRepository) *ProjectService {
	return &ProjectService{
		repo:     repo,
		validate: validator.New(),
	}
}

// CreateProject creates a new project
func (s *ProjectService) CreateProject(ctx context.Context, req models.CreateProjectRequest, userID uuid.UUID) (*models.ProjectResponse, error) {
	// Validate request
	if err := s.validate.Struct(req); err != nil {
		return nil, err
	}

	// Create project
	project := &models.Project{
		ID:          uuid.New(),
		Name:        req.Name,
		Description: req.Description,
		CreatedBy:   userID,
		IsArchived:  false,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Save to database
	if err := s.repo.Create(ctx, project); err != nil {
		logger.Error("Failed to create project", err, map[string]interface{}{
			"user_id": userID,
			"name":    req.Name,
		})
		return nil, err
	}

	// Get project stats
	issueCount, openIssueCount, err := s.repo.GetProjectStats(ctx, project.ID)
	if err != nil {
		logger.Error("Failed to get project stats", err, map[string]interface{}{
			"project_id": project.ID,
		})
		// Continue without stats if there's an error
		issueCount, openIssueCount = 0, 0
	}

	return &models.ProjectResponse{
		Project:        *project,
		IssueCount:    issueCount,
		OpenIssueCount: openIssueCount,
	}, nil
}

// GetProject retrieves a project by ID
func (s *ProjectService) GetProject(ctx context.Context, id uuid.UUID) (*models.ProjectResponse, error) {
	project, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if err == repository.ErrProjectNotFound {
			return nil, err
		}
		logger.Error("Failed to get project", err, map[string]interface{}{
			"project_id": id,
		})
		return nil, err
	}

	// Get project stats
	issueCount, openIssueCount, err := s.repo.GetProjectStats(ctx, id)
	if err != nil {
		logger.Error("Failed to get project stats", err, map[string]interface{}{
			"project_id": id,
		})
		// Continue without stats if there's an error
		issueCount, openIssueCount = 0, 0
	}

	return &models.ProjectResponse{
		Project:        *project,
		IssueCount:    issueCount,
		OpenIssueCount: openIssueCount,
	}, nil
}

// ListProjects retrieves a paginated list of projects
func (s *ProjectService) ListProjects(ctx context.Context, page, pageSize int) (*models.ProjectListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	projects, total, err := s.repo.List(ctx, page, pageSize, nil)
	if err != nil {
		logger.Error("Failed to list projects", err, map[string]interface{}{
			"page":      page,
			"page_size": pageSize,
		})
		return nil, err
	}

	// Get stats for each project
	projectResponses := make([]models.ProjectResponse, len(projects))
	for i, project := range projects {
		issueCount, openIssueCount, err := s.repo.GetProjectStats(ctx, project.ID)
		if err != nil {
			logger.Error("Failed to get project stats", err, map[string]interface{}{
				"project_id": project.ID,
			})
			// Continue without stats if there's an error
			issueCount, openIssueCount = 0, 0
		}

		projectResponses[i] = models.ProjectResponse{
			Project:        project,
			IssueCount:    issueCount,
			OpenIssueCount: openIssueCount,
		}
	}

	return &models.ProjectListResponse{
		Projects: projectResponses,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// UpdateProject updates an existing project
func (s *ProjectService) UpdateProject(ctx context.Context, id uuid.UUID, req models.UpdateProjectRequest) (*models.ProjectResponse, error) {
	// Validate request
	if err := s.validate.Struct(req); err != nil {
		return nil, err
	}

	// Get existing project
	project, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Name != nil {
		project.Name = *req.Name
	}
	if req.Description != nil {
		project.Description = *req.Description
	}
	if req.IsArchived != nil {
		project.IsArchived = *req.IsArchived
	}
	project.UpdatedAt = time.Now()

	// Save changes
	if err := s.repo.Update(ctx, project); err != nil {
		logger.Error("Failed to update project", err, map[string]interface{}{
			"project_id": id,
		})
		return nil, err
	}

	// Get project stats
	issueCount, openIssueCount, err := s.repo.GetProjectStats(ctx, id)
	if err != nil {
		logger.Error("Failed to get project stats", err, map[string]interface{}{
			"project_id": id,
		})
		// Continue without stats if there's an error
		issueCount, openIssueCount = 0, 0
	}

	return &models.ProjectResponse{
		Project:        *project,
		IssueCount:    issueCount,
		OpenIssueCount: openIssueCount,
	}, nil
}

// DeleteProject soft deletes a project
func (s *ProjectService) DeleteProject(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		logger.Error("Failed to delete project", err, map[string]interface{}{
			"project_id": id,
		})
		return err
	}
	return nil
} 