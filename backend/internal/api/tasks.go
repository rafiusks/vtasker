package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/backend/internal/models"
	"github.com/rafaelzasas/vtasker/backend/internal/repository"
)

type TaskHandler struct {
	repo *repository.TaskRepository
}

func NewTaskHandler(pool *pgxpool.Pool) *TaskHandler {
	return &TaskHandler{
		repo: repository.NewTaskRepository(pool),
	}
}

// ListTasks returns a list of tasks with optional filtering
func (h *TaskHandler) ListTasks(c *gin.Context) {
	filters := repository.TaskFilters{
		Status:   models.StatusCode(c.Query("status")),
		Priority: models.PriorityCode(c.Query("priority")),
		Type:     models.TypeCode(c.Query("type")),
	}

	tasks, err := h.repo.GetTasks(c.Request.Context(), filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// GetTask returns a single task by ID
func (h *TaskHandler) GetTask(c *gin.Context) {
	task, err := h.repo.GetTask(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if task == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}
	c.JSON(http.StatusOK, task)
}

// CreateTask creates a new task
func (h *TaskHandler) CreateTask(c *gin.Context) {
	var input models.CreateTaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	task, err := h.repo.CreateTask(c.Request.Context(), &input, userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, task)
}

// UpdateTask updates an existing task
func (h *TaskHandler) UpdateTask(c *gin.Context) {
	var input models.UpdateTaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	task, err := h.repo.UpdateTask(c.Request.Context(), c.Param("id"), &input, userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, task)
}

// DeleteTask deletes a task
func (h *TaskHandler) DeleteTask(c *gin.Context) {
	if err := h.repo.DeleteTask(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// ListTaskStatuses returns all task statuses
func (h *TaskHandler) ListTaskStatuses(c *gin.Context) {
	statuses, err := h.repo.ListTaskStatuses(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, statuses)
}

// ListTaskPriorities returns all task priorities
func (h *TaskHandler) ListTaskPriorities(c *gin.Context) {
	priorities, err := h.repo.ListTaskPriorities(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, priorities)
}

// ListTaskTypes returns all task types
func (h *TaskHandler) ListTaskTypes(c *gin.Context) {
	types, err := h.repo.ListTaskTypes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, types)
}

// Register registers all task routes
func (h *TaskHandler) Register(router *gin.RouterGroup) {
	tasks := router.Group("/tasks")
	{
		tasks.GET("", h.ListTasks)
		tasks.POST("", h.CreateTask)
		tasks.GET("/:id", h.GetTask)
		tasks.PUT("/:id", h.UpdateTask)
		tasks.DELETE("/:id", h.DeleteTask)
	}

	router.GET("/task-statuses", h.ListTaskStatuses)
	router.GET("/task-priorities", h.ListTaskPriorities)
	router.GET("/task-types", h.ListTaskTypes)
}

func (h *TaskHandler) logTaskAudit(ctx context.Context, event string, taskID string, payload interface{}) {
	go func() {
		details, err := json.Marshal(payload)
		if err != nil {
			log.Printf("Failed to marshal audit payload: %v", err)
			details = []byte("{}")
		}

		auditEntry := models.AuditLog{
			Action:     "task:" + event,
			TaskID:     taskID,
			Details:    string(details),
			CreatedAt:  time.Now(),
		}
		
		if err := h.repo.CreateAuditLog(ctx, &auditEntry); err != nil {
			log.Printf("Failed to write audit log: %v", err)
		}
	}()
}