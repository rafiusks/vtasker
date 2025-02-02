package api

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// SetupRoutes configures all the routes for the API
func SetupRoutes(router *gin.Engine, pool *pgxpool.Pool) {
	// Create handlers
	taskHandler := NewTaskHandler(pool)

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
			tasks.PUT("/:id/move", taskHandler.MoveTask)
			tasks.DELETE("/:id", taskHandler.DeleteTask)
		}
	}
} 