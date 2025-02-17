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

func NewUserHandler(userRepo repository.UserRepository) *UserHandler {
	return &UserHandler{
		userRepo: userRepo,
	}
}

func (h *UserHandler) RegisterRoutes(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(auth.RequireAuth)
		r.Get("/api/v1/users/{userId}", h.GetUser)
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
		"id": user.ID,
		"email": user.Email,
		"name": user.Name,
		"avatar_url": user.AvatarURL,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	})
} 