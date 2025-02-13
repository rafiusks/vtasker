package api

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/backend/internal/services"
)

// SetupRoutes configures all the routes for the API
func SetupRoutes(router *gin.Engine, pool *pgxpool.Pool) {
	// Add detailed error logging middleware
	router.Use(DetailedErrorLogger())

	// Create services
	authService := services.NewAuthService(pool, "your-secret-key") // TODO: Get from env

	// Create handlers
	taskHandler := NewTaskHandler(pool)
	authHandler := NewAuthHandler(authService)
	boardHandler := NewBoardHandler(pool)
	userHandler := NewUserHandler(pool)
	healthHandler := NewHealthHandler(pool)

	// Register health check routes
	healthHandler.Register(router)

	// Legacy routes (for compatibility)
	legacy := router.Group("/api")
	{
		// Auth routes
		legacy.POST("/auth/register", authHandler.Register)
		legacy.POST("/auth/login", authHandler.Login)
		legacy.POST("/auth/refresh", authHandler.RefreshToken)

		// Protected routes
		protected := legacy.Group("")
		protected.Use(authHandler.AuthMiddleware())
		{
			// Task routes
			taskHandler.Register(protected)

			// Board routes
			boardHandler.Register(protected)

			// User routes
			userHandler.Register(protected)
		}
	}

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Auth routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
		}

		// Protected routes
		protected := v1.Group("")
		protected.Use(authHandler.AuthMiddleware())
		{
			// Task routes
			taskHandler.Register(protected)

			// Board routes
			boardHandler.Register(protected)

			// User routes
			userHandler.Register(protected)
		}
	}
}
