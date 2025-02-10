package api

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// SetupRoutes configures all the routes for the API
func SetupRoutes(router *gin.Engine, pool *pgxpool.Pool) {
	// Add detailed error logging middleware
	router.Use(DetailedErrorLogger())

	// Create handlers
	taskHandler := NewTaskHandler(pool)

	// Legacy routes (for compatibility)
	legacy := router.Group("/api")
	{
		legacy.GET("/tasks", taskHandler.ListTasks)
		legacy.GET("/tasks/:id", taskHandler.GetTask)
		legacy.POST("/tasks", taskHandler.CreateTask)
		legacy.PUT("/tasks/:id", taskHandler.UpdateTask)
		legacy.PUT("/tasks/:id/move", taskHandler.MoveTask)
		legacy.DELETE("/tasks/:id", taskHandler.DeleteTask)
		legacy.POST("/tasks/clear", taskHandler.ClearTasks)
		legacy.GET("/task-statuses", taskHandler.ListTaskStatuses)
		legacy.GET("/task-priorities", taskHandler.ListTaskPriorities)
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
			tasks.PUT("/:id/move", taskHandler.MoveTask)
			tasks.DELETE("/:id", taskHandler.DeleteTask)
			tasks.POST("/clear", taskHandler.ClearTasks)
		}

		// Task status routes
		v1.GET("/task-statuses", taskHandler.ListTaskStatuses)
		v1.GET("/task-priorities", taskHandler.ListTaskPriorities)
		v1.GET("/task-types", taskHandler.ListTaskTypes)
	}
}