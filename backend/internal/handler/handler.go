package handler

import (
	"database/sql"

	"github.com/go-chi/chi/v5"
	"github.com/vtasker/internal/auth"
	"github.com/vtasker/internal/config"
	"github.com/vtasker/internal/repository"
	"github.com/vtasker/internal/service"
)

type Handler struct {
	router  chi.Router
	auth    *AuthHandler
	user    *UserHandler
	issue   *IssueHandler
	project *ProjectHandler
	config  *config.Config
}

func NewHandler(userRepo repository.UserRepository, sessionStore auth.SessionStore, db *sql.DB, cfg *config.Config) *Handler {
	// Initialize repositories
	issueRepo := repository.NewIssueRepository(db)
	projectRepo := repository.NewProjectRepository(db)

	// Initialize services
	issueService := service.NewIssueService(issueRepo, projectRepo, userRepo)
	projectService := service.NewProjectService(projectRepo, cfg)

	return &Handler{
		router:  chi.NewRouter(),
		auth:    NewAuthHandler(userRepo, sessionStore),
		user:    NewUserHandler(userRepo),
		issue:   NewIssueHandler(issueService),
		project: NewProjectHandler(projectService, cfg),
		config:  cfg,
	}
}

func (h *Handler) Routes() chi.Router {
	// Mount auth routes
	h.router.Post(h.config.GetAPIPath("/auth/check-email"), h.auth.CheckEmail)
	h.router.Post(h.config.GetAPIPath("/auth/sign-up"), h.auth.SignUp)
	h.router.Post(h.config.GetAPIPath("/auth/sign-in"), h.auth.SignIn)

	// Session management routes (protected by auth middleware)
	h.router.Group(func(r chi.Router) {
		r.Use(auth.RequireAuth)
		r.Get(h.config.GetAPIPath("/auth/sessions"), h.auth.ListSessions)
		r.Post(h.config.GetAPIPath("/auth/sessions/revoke"), h.auth.RevokeSession)
		r.Post(h.config.GetAPIPath("/auth/sessions/revoke-all"), h.auth.RevokeAllSessions)
	})

	// Mount user routes
	h.user.RegisterRoutes(h.router)

	// Mount issue routes
	h.issue.RegisterRoutes(h.router)

	// Mount project routes
	h.project.RegisterRoutes(h.router)

	return h.router
} 