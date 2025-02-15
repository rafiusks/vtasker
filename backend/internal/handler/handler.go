package handler

import (
	"github.com/go-chi/chi/v5"
	"github.com/vtasker/internal/repository"
)

type Handler struct {
	router chi.Router
	auth   *AuthHandler
}

func NewHandler(userRepo repository.UserRepository) *Handler {
	return &Handler{
		router: chi.NewRouter(),
		auth:   NewAuthHandler(userRepo),
	}
}

func (h *Handler) Routes() chi.Router {
	h.router.Post("/auth/check-email", h.auth.CheckEmail)
	h.router.Post("/auth/sign-up", h.auth.SignUp)
	return h.router
} 