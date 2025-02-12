package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/rafaelzasas/vtasker/backend/internal/models"
	"github.com/rafaelzasas/vtasker/backend/internal/repository"
)

// BoardHandler handles HTTP requests for boards
type BoardHandler struct {
	boardRepo repository.BoardRepository
}

// NewBoardHandler creates a new board handler
func NewBoardHandler(boardRepo repository.BoardRepository) *BoardHandler {
	return &BoardHandler{boardRepo: boardRepo}
}

// Routes returns the routes for the board handler
func (h *BoardHandler) Routes() chi.Router {
	r := chi.NewRouter()

	r.Get("/", h.ListBoards)
	r.Post("/", h.CreateBoard)
	r.Get("/{id}", h.GetBoard)
	r.Put("/{id}", h.UpdateBoard)
	r.Delete("/{id}", h.DeleteBoard)
	r.Get("/b/{slug}", h.GetBoardBySlug)
	r.Patch("/{id}", h.UpdateBoardAdmin) // Super admin only

	return r
}

// ListBoards returns a list of boards accessible by the user
func (h *BoardHandler) ListBoards(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("user").(*models.User)
	
	// Check if super admin is requesting all boards
	if r.URL.Query().Get("list") == "all" {
		if !user.IsSuperAdmin() {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		boards, err := h.boardRepo.ListAllBoards(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(boards)
		return
	}

	// Regular user board listing
	boards, err := h.boardRepo.ListBoards(r.Context(), user.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(boards)
}

// ListAllBoards returns a list of all boards (super admin only)
func (h *BoardHandler) ListAllBoards(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	user := r.Context().Value("user").(*models.User)
	if !user.IsSuperAdmin() {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	boards, err := h.boardRepo.ListAllBoards(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(boards)
}

// CreateBoard creates a new board
func (h *BoardHandler) CreateBoard(w http.ResponseWriter, r *http.Request) {
	var input models.CreateBoardInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user := r.Context().Value("user").(*models.User)
	board, err := h.boardRepo.CreateBoard(r.Context(), &input, user.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(board)
}

// GetBoard returns a board by ID
func (h *BoardHandler) GetBoard(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	user := r.Context().Value("user").(*models.User)

	board, err := h.boardRepo.GetBoard(r.Context(), id, user.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(board)
}

// GetBoardBySlug returns a board by slug
func (h *BoardHandler) GetBoardBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	user := r.Context().Value("user").(*models.User)

	board, err := h.boardRepo.GetBoardBySlug(r.Context(), slug, user.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(board)
}

// UpdateBoard updates a board
func (h *BoardHandler) UpdateBoard(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	user := r.Context().Value("user").(*models.User)

	var input models.UpdateBoardInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	board, err := h.boardRepo.UpdateBoard(r.Context(), id, &input, user.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(board)
}

// DeleteBoard deletes a board
func (h *BoardHandler) DeleteBoard(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	user := r.Context().Value("user").(*models.User)

	// Check if user is super admin
	isSuperAdmin := user.IsSuperAdmin()

	if err := h.boardRepo.DeleteBoard(r.Context(), id, user.ID, isSuperAdmin); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// UpdateBoardAdmin updates a board (super admin only)
func (h *BoardHandler) UpdateBoardAdmin(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	user := r.Context().Value("user").(*models.User)
	if !user.IsSuperAdmin() {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Board ID is required", http.StatusBadRequest)
		return
	}

	var input models.UpdateBoardInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	board, err := h.boardRepo.UpdateBoard(r.Context(), id, &input, user.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(board)
} 