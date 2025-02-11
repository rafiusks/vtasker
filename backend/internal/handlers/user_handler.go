package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/rafaelzasas/vtasker/backend/internal/models/user"
	"github.com/rafaelzasas/vtasker/backend/internal/repository"
)

// UserHandler handles HTTP requests for users
type UserHandler struct {
	userRepo repository.UserRepository
}

// NewUserHandler creates a new user handler
func NewUserHandler(userRepo repository.UserRepository) *UserHandler {
	return &UserHandler{userRepo: userRepo}
}

// Routes returns the routes for the user handler
func (h *UserHandler) Routes() chi.Router {
	r := chi.NewRouter()

	r.Get("/", h.ListUsers)
	r.Get("/{id}", h.GetUser)
	r.Patch("/{id}", h.UpdateUser)
	r.Delete("/{id}", h.DeleteUser)

	return r
}

// ListUsers returns a list of all users (super admin only)
func (h *UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	currentUser := r.Context().Value("user").(*user.User)
	if !currentUser.IsSuperAdmin() {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	users, err := h.userRepo.List(r.Context(), repository.UserFilter{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(users)
}

// GetUser returns a user by ID (super admin only)
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	currentUser := r.Context().Value("user").(*user.User)
	if !currentUser.IsSuperAdmin() {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	foundUser, err := h.userRepo.GetByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrNotFound {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(foundUser)
}

// UpdateUser updates a user (super admin only)
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	currentUser := r.Context().Value("user").(*user.User)
	if !currentUser.IsSuperAdmin() {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var input user.UpdateInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get the user to update
	userToUpdate, err := h.userRepo.GetByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrNotFound {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update user fields
	if input.RoleID != nil {
		userToUpdate.RoleID = *input.RoleID
	}
	if input.FullName != nil {
		userToUpdate.FullName = *input.FullName
	}
	if input.Email != nil {
		userToUpdate.Email = *input.Email
	}
	if input.AvatarURL != nil {
		userToUpdate.AvatarURL = *input.AvatarURL
	}
	if input.Password != nil {
		if err := userToUpdate.UpdatePassword(*input.Password); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Save changes
	if err := h.userRepo.Update(r.Context(), userToUpdate); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(userToUpdate)
}

// DeleteUser deletes a user (super admin only)
func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	currentUser := r.Context().Value("user").(*user.User)
	if !currentUser.IsSuperAdmin() {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	if err := h.userRepo.Delete(r.Context(), id); err != nil {
		if err == repository.ErrNotFound {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
} 