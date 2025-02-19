package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/vtasker/internal/config"
	"github.com/vtasker/internal/middleware"
	"github.com/vtasker/internal/models"
	"github.com/vtasker/internal/service"
	"github.com/vtasker/pkg/logger"
)

// ProjectHandler handles HTTP requests for projects
type ProjectHandler struct {
	service     *service.ProjectService
	issueService *service.IssueService
	config      *config.Config
}

// NewProjectHandler creates a new project handler
func NewProjectHandler(service *service.ProjectService, issueService *service.IssueService, cfg *config.Config) *ProjectHandler {
	return &ProjectHandler{
		service:      service,
		issueService: issueService,
		config:      cfg,
	}
}

// RegisterRoutes registers the project routes
func (h *ProjectHandler) RegisterRoutes(r chi.Router) {
	r.Route(h.config.GetAPIPath("/projects"), func(r chi.Router) {
		r.Use(middleware.RequireAuth)
		r.Post("/", h.CreateProject)
		r.Get("/", h.ListProjects)
		r.Get("/{id}", h.GetProject)
		r.Put("/{id}", h.UpdateProject)
		r.Delete("/{id}", h.DeleteProject)
		r.Get("/{id}/issues", h.ListProjectIssues)
	})
}

// CreateProject handles project creation
func (h *ProjectHandler) CreateProject(w http.ResponseWriter, r *http.Request) {
	var req models.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	project, err := h.service.CreateProject(r.Context(), req, userID)
	if err != nil {
		logger.Error("Failed to create project", err, map[string]interface{}{
			"user_id": userID,
		})
		http.Error(w, "Failed to create project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(project)
}

// GetProject handles retrieving a single project
func (h *ProjectHandler) GetProject(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	project, err := h.service.GetProject(r.Context(), id)
	if err != nil {
		logger.Error("Failed to get project", err, map[string]interface{}{
			"project_id": id,
		})
		http.Error(w, "Failed to get project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}

// ListProjects handles retrieving a list of projects
func (h *ProjectHandler) ListProjects(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))

	projects, err := h.service.ListProjects(r.Context(), page, pageSize)
	if err != nil {
		logger.Error("Failed to list projects", err, nil)
		http.Error(w, "Failed to list projects", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}

// UpdateProject handles updating a project
func (h *ProjectHandler) UpdateProject(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	var req models.UpdateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	project, err := h.service.UpdateProject(r.Context(), id, req)
	if err != nil {
		logger.Error("Failed to update project", err, map[string]interface{}{
			"project_id": id,
		})
		http.Error(w, "Failed to update project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}

// DeleteProject handles deleting a project
func (h *ProjectHandler) DeleteProject(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteProject(r.Context(), id); err != nil {
		logger.Error("Failed to delete project", err, map[string]interface{}{
			"project_id": id,
		})
		http.Error(w, "Failed to delete project", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ListProjectIssues handles retrieving a list of issues for a project
func (h *ProjectHandler) ListProjectIssues(w http.ResponseWriter, r *http.Request) {
	projectID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))

	filter := &models.IssueFilter{
		ProjectID: &projectID,
	}

	if status := r.URL.Query().Get("status"); status != "" {
		filter.Status = &status
	}

	if priority := r.URL.Query().Get("priority"); priority != "" {
		filter.Priority = &priority
	}

	if assigneeID := r.URL.Query().Get("assignee_id"); assigneeID != "" {
		id, err := uuid.Parse(assigneeID)
		if err != nil {
			http.Error(w, "Invalid assignee ID", http.StatusBadRequest)
			return
		}
		filter.AssigneeID = &id
	}

	if search := r.URL.Query().Get("search"); search != "" {
		filter.Search = &search
	}

	issues, err := h.issueService.ListIssues(r.Context(), page, pageSize, filter)
	if err != nil {
		logger.Error("Failed to list project issues", err, map[string]interface{}{
			"project_id": projectID,
		})
		http.Error(w, "Failed to list project issues", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(issues)
} 