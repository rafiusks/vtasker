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

	// Legacy routes (for compatibility)
	legacy := router.Group("/api")
	{
		legacy.GET("/tasks", taskHandler.ListTasks)
		legacy.GET("/tasks/:id", taskHandler.GetTask)
		legacy.POST("/tasks", taskHandler.CreateTask)
		legacy.PUT("/tasks/:id", taskHandler.UpdateTask)
		legacy.DELETE("/tasks/:id", taskHandler.DeleteTask)
		legacy.GET("/task-statuses", taskHandler.ListTaskStatuses)
		legacy.GET("/task-priorities", taskHandler.ListTaskPriorities)
		legacy.GET("/task-types", taskHandler.ListTaskTypes)

		// Auth routes
		legacy.POST("/auth/register", authHandler.Register)
		legacy.POST("/auth/login", authHandler.Login)
	}

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Task routes
		tasks := v1.Group("/tasks")
		{
			tasks.POST("", taskHandler.CreateTask)
			tasks.GET("", taskHandler.ListTasks)
			tasks.GET("/:id", taskHandler.GetTask)
			tasks.PUT("/:id", taskHandler.UpdateTask)
			tasks.DELETE("/:id", taskHandler.DeleteTask)
		}

		// Task reference data routes
		v1.GET("/task-statuses", taskHandler.ListTaskStatuses)
		v1.GET("/task-priorities", taskHandler.ListTaskPriorities)
		v1.GET("/task-types", taskHandler.ListTaskTypes)

		// Auth routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}
	}
}