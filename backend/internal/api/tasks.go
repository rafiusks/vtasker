package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/internal/models"
	"github.com/rafaelzasas/vtasker/internal/repository"
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
	tasks, err := h.repo.ListTasks(c.Request.Context(), c.Query("status"), c.Query("priority"))
	if err != nil {
		log.Printf("Error listing tasks: %v", err)
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
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.CreateTask(c.Request.Context(), &task); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, task)
}

// UpdateTask updates an existing task
func (h *TaskHandler) UpdateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.UpdateTask(c.Request.Context(), c.Param("id"), &task); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, task)
}

// MoveTask updates a task's status and order
func (h *TaskHandler) MoveTask(c *gin.Context) {
	// Add request logging
	log.Printf("MoveTask request: %s %s", c.Request.Method, c.Request.URL)
	
	var req struct {
		StatusID         int    `json:"status_id" binding:"required"`
		Order            int    `json:"order" binding:"required,min=0"`
		PreviousStatusID int    `json:"previous_status_id"`
		Type             string `json:"type" binding:"required,oneof=feature bug chore"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Validation error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	taskID := c.Param("id")
	log.Printf("Processing move for task: %s", taskID)
	
	ctx := c.Request.Context()

	tx, err := h.repo.BeginTx(ctx)
	if err != nil {
		log.Printf("Transaction error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not start transaction"})
		return
	}
	defer tx.Rollback(ctx)

	// 1. Lock task with extended logging
	var currentOrder int
	var currentStatusID int
	lockQuery := `SELECT status_id, "order" FROM tasks WHERE id = $1 FOR UPDATE`
	log.Printf("Executing lock query: %s with ID: %s", lockQuery, taskID)
	
	err = tx.QueryRow(ctx, lockQuery, taskID).Scan(&currentStatusID, &currentOrder)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("Task not found: %s", taskID)
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		} else {
			log.Printf("Lock error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not lock task"})
		}
		return
	}
	log.Printf("Lock acquired for task: %s (current status: %d, order: %d)", 
		taskID, currentStatusID, currentOrder)

	// 2. Previous column update with logging
	if req.PreviousStatusID != 0 && currentStatusID != req.StatusID {
		prevUpdateQuery := `UPDATE tasks SET "order" = "order" - 1 
						  WHERE status_id = $1 AND "order" > $2`
		log.Printf("Updating previous column (status %d) for order > %d", 
			currentStatusID, currentOrder)
		
		res, err := tx.Exec(ctx, prevUpdateQuery, currentStatusID, currentOrder)
		if err != nil {
			log.Printf("Previous column update error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update previous column"})
			return
		}
		rows := res.RowsAffected()
		log.Printf("Updated %d rows in previous column", rows)
	}

	// 3. Target column update with logging
	targetUpdateQuery := `UPDATE tasks SET "order" = "order" + 1 
						 WHERE status_id = $1 AND "order" >= $2`
	log.Printf("Making space in target column (status %d) for order >= %d", 
		req.StatusID, req.Order)
		
	res, err := tx.Exec(ctx, targetUpdateQuery, req.StatusID, req.Order)
	if err != nil {
		log.Printf("Target column update error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update target column"})
		return
	}
	rows := res.RowsAffected()
	log.Printf("Updated %d rows in target column", rows)

	// 4. Main task update with detailed logging
	updateQuery := `UPDATE tasks 
				   SET status_id = $1, "order" = $2, type = $3
				   WHERE id = $4`
	log.Printf("Updating task with: status=%d, order=%d, type=%s, id=%s",
		req.StatusID, req.Order, req.Type, taskID)
		
	res, err = tx.Exec(ctx, updateQuery, 
		req.StatusID, req.Order, req.Type, taskID)
	if err != nil {
		log.Printf("Task update error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update task"})
		return
	}
	rows = res.RowsAffected()
	log.Printf("Updated %d rows in main task update", rows)

	if rows == 0 {
		log.Printf("Critical error: No rows affected in main task update")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Task update failed - no rows affected",
			"details": gin.H{
				"task_id": taskID,
				"status_id": req.StatusID,
				"order": req.Order,
				"type": req.Type,
			},
		})
		return
	}

	if err := tx.Commit(ctx); err != nil {
		log.Printf("Commit error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction failed"})
		return
	}
	log.Printf("Transaction committed successfully")

	// Return updated task with status details
	task, err := h.repo.GetTaskWithStatus(ctx, taskID)
	if err != nil {
		log.Printf("Fetch error: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"message": "Task moved successfully",
			"task_id": taskID,
			"status_id": req.StatusID,
			"order": req.Order,
		})
		return
	}

	h.logTaskAudit(ctx, "moved", taskID, map[string]interface{}{
		"from_status": currentStatusID,
		"to_status":   req.StatusID,
		"new_order":   req.Order,
	})

	c.JSON(http.StatusOK, task)
}

// DeleteTask deletes a task
func (h *TaskHandler) DeleteTask(c *gin.Context) {
	// Check for dependent tasks
	count, err := h.repo.GetDependentTasks(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"error":         "Cannot delete task: other tasks depend on it",
			"dependent_count": count,
		})
		return
	}

	if err := h.repo.DeleteTask(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// ListTaskStatuses returns all available task statuses
func (h *TaskHandler) ListTaskStatuses(c *gin.Context) {
	statuses, err := h.repo.ListTaskStatuses(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, statuses)
}

// ListTaskPriorities returns all available task priorities
func (h *TaskHandler) ListTaskPriorities(c *gin.Context) {
	priorities, err := h.repo.ListTaskPriorities(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, priorities)
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