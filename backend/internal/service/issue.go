package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/vtasker/internal/models"
	"github.com/vtasker/internal/repository"
)

// IssueService handles business logic for issues
type IssueService struct {
	issueRepo    repository.IssueRepository
	projectRepo  repository.ProjectRepository
	userRepo     repository.UserRepository
}

// NewIssueService creates a new issue service
func NewIssueService(
	issueRepo repository.IssueRepository,
	projectRepo repository.ProjectRepository,
	userRepo repository.UserRepository,
) *IssueService {
	return &IssueService{
		issueRepo:    issueRepo,
		projectRepo:  projectRepo,
		userRepo:     userRepo,
	}
}

// CreateIssue creates a new issue
func (s *IssueService) CreateIssue(ctx context.Context, req *models.CreateIssueRequest, userID uuid.UUID) (*models.IssueResponse, error) {
	// Validate project exists
	project, err := s.projectRepo.GetByID(ctx, req.ProjectID)
	if err != nil {
		if err == repository.ErrProjectNotFound {
			return nil, models.ErrInvalidProject
		}
		return nil, err
	}

	// Validate assignee exists if provided
	var assigneeName string
	if req.AssigneeID != nil {
		assignee, err := s.userRepo.GetByID(ctx, *req.AssigneeID)
		if err != nil {
			if err == repository.ErrUserNotFound {
				return nil, models.ErrInvalidUser
			}
			return nil, err
		}
		assigneeName = assignee.GetFullName()
	}

	now := time.Now()
	issue := &models.Issue{
		ID:          uuid.New(),
		Title:       req.Title,
		Description: req.Description,
		Status:      models.StatusTodo,
		Priority:    req.Priority,
		ProjectID:   req.ProjectID,
		AssigneeID:  req.AssigneeID,
		CreatedBy:   userID,
		IsArchived:  false,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.issueRepo.Create(ctx, issue); err != nil {
		return nil, err
	}

	response := &models.IssueResponse{
		Issue:        *issue,
		ProjectName:  project.Name,
		AssigneeName: assigneeName,
	}

	return response, nil
}

// GetIssue retrieves an issue by ID
func (s *IssueService) GetIssue(ctx context.Context, id uuid.UUID) (*models.IssueResponse, error) {
	issue, err := s.issueRepo.GetByID(ctx, id)
	if err != nil {
		if err == repository.ErrIssueNotFound {
			return nil, models.ErrNotFound
		}
		return nil, err
	}

	project, err := s.projectRepo.GetByID(ctx, issue.ProjectID)
	if err != nil {
		return nil, err
	}

	var assigneeName string
	if issue.AssigneeID != nil {
		assignee, err := s.userRepo.GetByID(ctx, *issue.AssigneeID)
		if err != nil && err != repository.ErrUserNotFound {
			return nil, err
		}
		if assignee != nil {
			assigneeName = assignee.GetFullName()
		}
	}

	response := &models.IssueResponse{
		Issue:        *issue,
		ProjectName:  project.Name,
		AssigneeName: assigneeName,
	}

	return response, nil
}

// ListIssues retrieves a paginated list of issues
func (s *IssueService) ListIssues(ctx context.Context, page, pageSize int, filter *models.IssueFilter) (*models.IssueListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	issues, total, err := s.issueRepo.List(ctx, page, pageSize, filter)
	if err != nil {
		return nil, err
	}

	// Create a map to store project and user details
	projectNames := make(map[uuid.UUID]string)
	assigneeNames := make(map[uuid.UUID]string)

	// Collect unique project and user IDs
	projectIDs := make(map[uuid.UUID]bool)
	assigneeIDs := make(map[uuid.UUID]bool)
	for _, issue := range issues {
		projectIDs[issue.ProjectID] = true
		if issue.AssigneeID != nil {
			assigneeIDs[*issue.AssigneeID] = true
		}
	}

	// Fetch project names
	for projectID := range projectIDs {
		project, err := s.projectRepo.GetByID(ctx, projectID)
		if err != nil && err != repository.ErrProjectNotFound {
			return nil, err
		}
		if project != nil {
			projectNames[projectID] = project.Name
		}
	}

	// Fetch assignee names
	for assigneeID := range assigneeIDs {
		user, err := s.userRepo.GetByID(ctx, assigneeID)
		if err != nil && err != repository.ErrUserNotFound {
			return nil, err
		}
		if user != nil {
			assigneeNames[assigneeID] = user.GetFullName()
		}
	}

	// Build response items
	items := make([]models.IssueResponse, len(issues))
	for i, issue := range issues {
		var assigneeName string
		if issue.AssigneeID != nil {
			assigneeName = assigneeNames[*issue.AssigneeID]
		}

		items[i] = models.IssueResponse{
			Issue:        issue,
			ProjectName:  projectNames[issue.ProjectID],
			AssigneeName: assigneeName,
		}
	}

	response := &models.IssueListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: (total + int64(pageSize) - 1) / int64(pageSize),
	}

	return response, nil
}

// UpdateIssue updates an existing issue
func (s *IssueService) UpdateIssue(ctx context.Context, id uuid.UUID, req *models.UpdateIssueRequest) (*models.IssueResponse, error) {
	issue, err := s.issueRepo.GetByID(ctx, id)
	if err != nil {
		if err == repository.ErrIssueNotFound {
			return nil, models.ErrNotFound
		}
		return nil, err
	}

	if req.Title != nil {
		issue.Title = *req.Title
	}
	if req.Description != nil {
		issue.Description = *req.Description
	}
	if req.Status != nil {
		issue.Status = *req.Status
	}
	if req.Priority != nil {
		issue.Priority = *req.Priority
	}
	if req.AssigneeID != nil {
		// Validate assignee exists
		if *req.AssigneeID != uuid.Nil {
			_, err := s.userRepo.GetByID(ctx, *req.AssigneeID)
			if err != nil {
				if err == repository.ErrUserNotFound {
					return nil, models.ErrInvalidUser
				}
				return nil, err
			}
		}
		issue.AssigneeID = req.AssigneeID
	}

	issue.UpdatedAt = time.Now()

	if err := s.issueRepo.Update(ctx, issue); err != nil {
		return nil, err
	}

	return s.GetIssue(ctx, id)
}

// DeleteIssue soft deletes an issue
func (s *IssueService) DeleteIssue(ctx context.Context, id uuid.UUID) error {
	return s.issueRepo.Delete(ctx, id)
} 