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

// IssueHandler handles HTTP requests for issues
type IssueHandler struct {
	service *service.IssueService
}

// NewIssueHandler creates a new issue handler
func NewIssueHandler(service *service.IssueService) *IssueHandler {
	return &IssueHandler{
		service: service,
	}
}

// RegisterRoutes registers the issue routes
func (h *IssueHandler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/issues", func(r chi.Router) {
		r.Post("/", h.CreateIssue)
		r.Get("/", h.ListIssues)
		r.Get("/{id}", h.GetIssue)
		r.Put("/{id}", h.UpdateIssue)
		r.Delete("/{id}", h.DeleteIssue)
	})
}

// CreateIssue handles issue creation
func (h *IssueHandler) CreateIssue(w http.ResponseWriter, r *http.Request) {
	var req models.CreateIssueRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// TODO: Get user ID from context after auth middleware is implemented
	userID := uuid.New() // Temporary placeholder

	issue, err := h.service.CreateIssue(r.Context(), &req, userID)
	if err != nil {
		logger.Error("Failed to create issue", err, map[string]interface{}{
			"user_id": userID,
		})
		switch err {
		case models.ErrInvalidProject, models.ErrInvalidUser:
			http.Error(w, err.Error(), http.StatusBadRequest)
		default:
			http.Error(w, "Failed to create issue", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(issue)
}

// GetIssue handles retrieving a single issue
func (h *IssueHandler) GetIssue(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid issue ID", http.StatusBadRequest)
		return
	}

	issue, err := h.service.GetIssue(r.Context(), id)
	if err != nil {
		logger.Error("Failed to get issue", err, map[string]interface{}{
			"issue_id": id,
		})
		switch err {
		case models.ErrNotFound:
			http.Error(w, "Issue not found", http.StatusNotFound)
		default:
			http.Error(w, "Failed to get issue", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(issue)
}

// ListIssues handles retrieving a list of issues
func (h *IssueHandler) ListIssues(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))

	// Parse filter parameters
	var filter models.IssueFilter

	if projectID := r.URL.Query().Get("project_id"); projectID != "" {
		id, err := uuid.Parse(projectID)
		if err != nil {
			http.Error(w, "Invalid project ID", http.StatusBadRequest)
			return
		}
		filter.ProjectID = &id
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

	issues, err := h.service.ListIssues(r.Context(), page, pageSize, &filter)
	if err != nil {
		logger.Error("Failed to list issues", err, nil)
		http.Error(w, "Failed to list issues", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(issues)
}

// UpdateIssue handles updating an issue
func (h *IssueHandler) UpdateIssue(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid issue ID", http.StatusBadRequest)
		return
	}

	var req models.UpdateIssueRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	issue, err := h.service.UpdateIssue(r.Context(), id, &req)
	if err != nil {
		logger.Error("Failed to update issue", err, map[string]interface{}{
			"issue_id": id,
		})
		switch err {
		case models.ErrNotFound:
			http.Error(w, "Issue not found", http.StatusNotFound)
		case models.ErrInvalidUser:
			http.Error(w, err.Error(), http.StatusBadRequest)
		default:
			http.Error(w, "Failed to update issue", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(issue)
}

// DeleteIssue handles deleting an issue
func (h *IssueHandler) DeleteIssue(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid issue ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteIssue(r.Context(), id); err != nil {
		logger.Error("Failed to delete issue", err, map[string]interface{}{
			"issue_id": id,
		})
		switch err {
		case models.ErrNotFound:
			http.Error(w, "Issue not found", http.StatusNotFound)
		default:
			http.Error(w, "Failed to delete issue", http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
} 