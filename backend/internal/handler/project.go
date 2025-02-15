package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/vtasker/internal/models"
	"github.com/vtasker/internal/service"
	"github.com/vtasker/pkg/logger"
)

// ProjectHandler handles HTTP requests for projects
type ProjectHandler struct {
	service *service.ProjectService
}

// NewProjectHandler creates a new project handler
func NewProjectHandler(service *service.ProjectService) *ProjectHandler {
	return &ProjectHandler{
		service: service,
	}
}

// RegisterRoutes registers the project routes
func (h *ProjectHandler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/projects", func(r chi.Router) {
		r.Post("/", h.CreateProject)
		r.Get("/", h.ListProjects)
		r.Get("/{id}", h.GetProject)
		r.Put("/{id}", h.UpdateProject)
		r.Delete("/{id}", h.DeleteProject)
	})
}

// CreateProject handles project creation
func (h *ProjectHandler) CreateProject(w http.ResponseWriter, r *http.Request) {
	var req models.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// TODO: Get user ID from context after auth middleware is implemented
	userID := uuid.New() // Temporary placeholder

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