package handler

import (
	"github.com/go-chi/chi/v5"
	"github.com/vtasker/internal/auth"
	"github.com/vtasker/internal/repository"
)

type Handler struct {
	router chi.Router
	auth   *AuthHandler
}

func NewHandler(userRepo repository.UserRepository, sessionStore auth.SessionStore) *Handler {
	return &Handler{
		router: chi.NewRouter(),
		auth:   NewAuthHandler(userRepo, sessionStore),
	}
}

func (h *Handler) Routes() chi.Router {
	h.router.Post("/auth/check-email", h.auth.CheckEmail)
	h.router.Post("/auth/sign-up", h.auth.SignUp)
	h.router.Post("/auth/sign-in", h.auth.SignIn)

	// Session management routes (protected by auth middleware)
	h.router.Group(func(r chi.Router) {
		r.Use(auth.RequireAuth)
		r.Get("/auth/sessions", h.auth.ListSessions)
		r.Post("/auth/sessions/revoke", h.auth.RevokeSession)
		r.Post("/auth/sessions/revoke-all", h.auth.RevokeAllSessions)
	})

	return h.router
} 