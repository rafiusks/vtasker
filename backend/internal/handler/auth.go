package handler

import (
	"encoding/json"
	"net/http"

	"github.com/vtasker/internal/repository"
)

type AuthHandler struct {
	userRepo repository.UserRepository
}

func NewAuthHandler(userRepo repository.UserRepository) *AuthHandler {
	return &AuthHandler{
		userRepo: userRepo,
	}
}

type CheckEmailRequest struct {
	Email string `json:"email"`
}

type CheckEmailResponse struct {
	Exists bool `json:"exists"`
}

func (h *AuthHandler) CheckEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CheckEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	exists, err := h.userRepo.CheckEmailExists(r.Context(), req.Email)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	response := CheckEmailResponse{
		Exists: exists,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
} 