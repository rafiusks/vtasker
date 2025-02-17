package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/vtasker/internal/auth"
	"github.com/vtasker/internal/repository"
)

type UserHandler struct {
	userRepo repository.UserRepository
}

type UpdateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

func NewUserHandler(userRepo repository.UserRepository) *UserHandler {
	return &UserHandler{
		userRepo: userRepo,
	}
}

func (h *UserHandler) RegisterRoutes(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(auth.RequireAuth)
		r.Get("/api/v1/users/{userId}", h.GetUser)
		r.Patch("/api/v1/users/{userId}", h.UpdateUser)
	})
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	// Get user ID from URL parameters
	userID := chi.URLParam(r, "userId")

	// Validate user ID format
	parsedID, err := uuid.Parse(userID)
	if err != nil {
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	// Get authenticated user from context
	ctxUserID := r.Context().Value(auth.UserIDKey).(string)
	if ctxUserID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Users can only access their own profile
	if ctxUserID != userID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	// Fetch user from repository
	user, err := h.userRepo.GetByID(r.Context(), parsedID)
	if err != nil {
		if err == repository.ErrUserNotFound {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Return user profile
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"avatar_url": user.AvatarURL,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	})
}

func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	// Get user ID from URL parameters
	userID := chi.URLParam(r, "userId")

	// Validate user ID format
	parsedID, err := uuid.Parse(userID)
	if err != nil {
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	// Get authenticated user from context
	ctxUserID := r.Context().Value(auth.UserIDKey).(string)
	if ctxUserID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Users can only update their own profile
	if ctxUserID != userID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	// Parse request body
	var req UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.Name == "" && req.Email == "" {
		http.Error(w, "At least one field (name or email) must be provided", http.StatusBadRequest)
		return
	}

	// Fetch current user
	user, err := h.userRepo.GetByID(r.Context(), parsedID)
	if err != nil {
		if err == repository.ErrUserNotFound {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Update fields if provided
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Email != "" {
		// Check if email is already taken
		exists, err := h.userRepo.CheckEmailExists(r.Context(), req.Email)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		if exists && req.Email != user.Email {
			http.Error(w, "Email already taken", http.StatusConflict)
			return
		}
		user.Email = req.Email
	}

	// Save updates
	if err := h.userRepo.Update(r.Context(), user); err != nil {
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	// Return updated user
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"avatar_url": user.AvatarURL,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	})
} 