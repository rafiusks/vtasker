package api

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"
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
	log.Printf("Starting ListTasks with status=%v, priority=%v, type=%v", 
		c.Query("status"), c.Query("priority"), c.Query("type"))
	
	filters := repository.TaskFilters{}
	
	if status := c.Query("status"); status != "" {
		log.Printf("Converting status %q to integer", status)
		statusID, err := strconv.Atoi(status)
		if err != nil {
			log.Printf("Error converting status to integer: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status ID"})
			return
		}
		log.Printf("Converted status to %d (type: %T)", statusID, statusID)
		filters.Status = int32(statusID)
	}
	
	if priority := c.Query("priority"); priority != "" {
		log.Printf("Converting priority %q to integer", priority)
		priorityID, err := strconv.Atoi(priority)
		if err != nil {
			log.Printf("Error converting priority to integer: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid priority ID"})
			return
		}
		log.Printf("Converted priority to %d (type: %T)", priorityID, priorityID)
		filters.Priority = int32(priorityID)
	}
	
	if taskType := c.Query("type"); taskType != "" {
		log.Printf("Converting type %q to integer", taskType)
		typeID, err := strconv.Atoi(taskType)
		if err != nil {
			log.Printf("Error converting type to integer: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid type ID"})
			return
		}
		log.Printf("Converted type to %d (type: %T)", typeID, typeID)
		filters.Type = int32(typeID)
	}
	
	log.Printf("Calling GetTasks with filters: %+v", filters)
	tasks, err := h.repo.GetTasks(c.Request.Context(), filters)
	if err != nil {
		log.Printf("Error listing tasks: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error listing tasks: " + err.Error()})
		return
	}
	log.Printf("Retrieved %d tasks", len(tasks))
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
    log.Printf("UpdateTask: Starting update for task ID: %s", c.Param("id"))
    
    // Log the raw request body
    body, err := c.GetRawData()
    if err != nil {
        log.Printf("Error reading request body: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
        return
    }
    log.Printf("Raw request body: %s", string(body))
    
    // Restore the request body for binding
    c.Request.Body = io.NopCloser(bytes.NewBuffer(body))
    
    if err := c.ShouldBindJSON(&task); err != nil {
        log.Printf("Error binding JSON: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    log.Printf("Bound task data: %+v", task)

    // Set default type_id if not provided
    if task.TypeID == 0 {
        log.Printf("No type_id provided, getting default type")
        defaultType, err := h.repo.GetDefaultTaskType(c.Request.Context())
        if err != nil {
            log.Printf("Error getting default task type: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get default task type"})
            return
        }
        task.TypeID = defaultType.ID
        log.Printf("Set default type_id to: %d", task.TypeID)
    }

    // Get the existing task first
    log.Printf("Getting existing task with ID: %s", c.Param("id"))
    existingTask, err := h.repo.GetTask(c.Request.Context(), c.Param("id"))
    if err != nil {
        log.Printf("Error getting existing task: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    if existingTask == nil {
        log.Printf("Task not found with ID: %s", c.Param("id"))
        c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
        return
    }
    log.Printf("Found existing task: %+v", existingTask)

    // Merge the updates with existing task
    log.Printf("Merging updates with existing task")
    if task.Title != "" {
        log.Printf("Updating title from %q to %q", existingTask.Title, task.Title)
        existingTask.Title = task.Title
    }
    if task.Description != "" {
        log.Printf("Updating description from %q to %q", existingTask.Description, task.Description)
        existingTask.Description = task.Description
    }
    if task.StatusID != 0 {
        log.Printf("Updating status_id from %d to %d", existingTask.StatusID, task.StatusID)
        existingTask.StatusID = task.StatusID
    }
    if task.PriorityID != 0 {
        log.Printf("Updating priority_id from %d to %d", existingTask.PriorityID, task.PriorityID)
        existingTask.PriorityID = task.PriorityID
    }
    if task.TypeID != 0 {
        log.Printf("Updating type_id from %d to %d", existingTask.TypeID, task.TypeID)
        existingTask.TypeID = task.TypeID
    }
    if task.Content != nil {
        log.Printf("Updating content: %+v", task.Content)
        existingTask.Content = task.Content
    }
    if task.Relationships.Labels != nil {
        log.Printf("Updating labels: %v", task.Relationships.Labels)
        existingTask.Relationships.Labels = task.Relationships.Labels
    }
    if task.Relationships.Dependencies != nil {
        log.Printf("Updating dependencies: %v", task.Relationships.Dependencies)
        existingTask.Relationships.Dependencies = task.Relationships.Dependencies
    }
    log.Printf("Merged task: %+v", existingTask)

    // Update the task
    log.Printf("Calling repository UpdateTask")
    if err := h.repo.UpdateTask(c.Request.Context(), c.Param("id"), existingTask); err != nil {
        log.Printf("Error updating task: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    log.Printf("Task updated successfully in repository")

    // Fetch the updated task to return complete data
    log.Printf("Fetching updated task data")
    updatedTask, err := h.repo.GetTaskWithStatus(c.Request.Context(), c.Param("id"))
    if err != nil {
        log.Printf("Error fetching updated task: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    log.Printf("Returning updated task: %+v", updatedTask)

    c.JSON(http.StatusOK, updatedTask)
}

// MoveTask updates a task's status and order
func (h *TaskHandler) MoveTask(c *gin.Context) {
	// Add request logging
	log.Printf("MoveTask request: %s %s", c.Request.Method, c.Request.URL)
	
	// Read and log raw request body
	body, err := c.GetRawData()
	if err != nil {
		log.Printf("Error reading request body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}
	log.Printf("Raw request body: %s", string(body))
	
	// Restore the request body for binding
	c.Request.Body = io.NopCloser(bytes.NewBuffer(body))
	
	// Use a simple struct for request binding
	var req struct {
		StatusID         int    `json:"status_id"`
		Order           int    `json:"order"`
		PreviousStatusID int    `json:"previous_status_id"`
		Comment         string `json:"comment"`
		Type            string `json:"type"`
	}
	
	if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
		log.Printf("JSON decode error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
		return
	}

	// Validate required fields
	if req.StatusID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status_id is required"})
		return
	}
	if req.Type == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "type is required"})
		return
	}

	// Get task ID from URL parameter
	taskID := c.Param("id")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Task ID is required"})
		return
	}

	// Start a transaction
	ctx := c.Request.Context()
	tx, err := h.repo.BeginTx(ctx)
	if err != nil {
		log.Printf("Transaction start error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback(ctx)

	// 1. Get current task status
	var currentStatusID int
	err = tx.QueryRow(ctx, "SELECT status_id FROM tasks WHERE id = $1", taskID).Scan(&currentStatusID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Task not found",
				"details": gin.H{
					"task_id": taskID,
				},
			})
			return
		}
		log.Printf("Task query error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get task status",
			"details": gin.H{
				"task_id": taskID,
			},
		})
		return
	}

	// 2. Previous column update with logging
	if req.PreviousStatusID != 0 && currentStatusID != req.StatusID {
		prevUpdateQuery := `UPDATE tasks SET "order" = "order" - 1 
						  WHERE status_id = $1 AND "order" > $2`
		log.Printf("Updating previous column (status %d) for order > %d", 
			currentStatusID, req.Order)
		
		res, err := tx.Exec(ctx, prevUpdateQuery, currentStatusID, req.Order)
		if err != nil {
			log.Printf("Previous column update error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to update previous column",
				"details": gin.H{
					"task_id": taskID,
					"status_id": currentStatusID,
					"order": req.Order,
				},
			})
			return
		}
		log.Printf("Updated %d rows in previous column", res.RowsAffected())
	}

	// 3. Target column update with logging
	targetUpdateQuery := `UPDATE tasks SET "order" = "order" + 1 
						WHERE status_id = $1 AND "order" >= $2`
	log.Printf("Updating target column (status %d) for order >= %d", 
		req.StatusID, req.Order)
	
	res, err := tx.Exec(ctx, targetUpdateQuery, req.StatusID, req.Order)
	if err != nil {
		log.Printf("Target column update error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update target column",
			"details": gin.H{
				"task_id": taskID,
				"status_id": req.StatusID,
				"order": req.Order,
			},
		})
		return
	}
	log.Printf("Updated %d rows in target column", res.RowsAffected())

	// 4. Update task with logging
	// First get the type ID
	var typeID int32
	err = tx.QueryRow(ctx, "SELECT id FROM task_types WHERE code = $1", req.Type).Scan(&typeID)
	if err != nil {
		log.Printf("Error getting type ID for code %s: %v", req.Type, err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid task type",
			"details": gin.H{
				"type": req.Type,
				"error": err.Error(),
			},
		})
		return
	}
	log.Printf("Found type ID %d for code %s", typeID, req.Type)

	// Verify the status ID exists
	var statusExists bool
	err = tx.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM task_statuses WHERE id = $1)", req.StatusID).Scan(&statusExists)
	if err != nil {
		log.Printf("Error checking status ID %d: %v", req.StatusID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to verify status",
			"details": gin.H{
				"status_id": req.StatusID,
				"error": err.Error(),
			},
		})
		return
	}
	if !statusExists {
		log.Printf("Invalid status ID: %d", req.StatusID)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid status ID",
			"details": gin.H{
				"status_id": req.StatusID,
			},
		})
		return
	}
	log.Printf("Verified status ID %d exists", req.StatusID)

	updateQuery := `UPDATE tasks 
					SET status_id = $1, "order" = $2, type_id = $3, updated_at = NOW() 
					WHERE id = $4`
	log.Printf("Executing update query: %s with params: status_id=%d, order=%d, type_id=%d, id=%s", 
		updateQuery, req.StatusID, req.Order, typeID, taskID)
	
	res, err = tx.Exec(ctx, updateQuery, req.StatusID, req.Order, typeID, taskID)
	if err != nil {
		log.Printf("Task update error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update task",
			"details": gin.H{
				"task_id": taskID,
				"status_id": req.StatusID,
				"order": req.Order,
				"type_id": typeID,
				"error": err.Error(),
			},
		})
		return
	}
	if res.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Task not found",
			"details": gin.H{
				"task_id": taskID,
				"status_id": req.StatusID,
				"order": req.Order,
				"type_id": typeID,
			},
		})
		return
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		log.Printf("Transaction commit error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"message": "Task moved successfully",
		"task_id": taskID,
		"status_id": req.StatusID,
		"order": req.Order,
	})

	// Log the audit event
	h.logTaskAudit(ctx, "moved", taskID, map[string]interface{}{
		"from_status": currentStatusID,
		"to_status":   req.StatusID,
		"new_order":   req.Order,
	})
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

// ListTaskTypes returns a list of all task types
func (h *TaskHandler) ListTaskTypes(c *gin.Context) {
	types, err := h.repo.ListTaskTypes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, types)
}

// ClearTasks clears all tasks (for testing purposes only)
func (h *TaskHandler) ClearTasks(c *gin.Context) {
	err := h.repo.ClearTasks(c.Request.Context())
	if err != nil {
		log.Printf("Error clearing tasks: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// Register registers all task-related routes
func (h *TaskHandler) Register(router *gin.RouterGroup) {
	router.GET("/tasks", h.ListTasks)
	router.GET("/tasks/:id", h.GetTask)
	router.POST("/tasks", h.CreateTask)
	router.PUT("/tasks/:id", h.UpdateTask)
	router.DELETE("/tasks/:id", h.DeleteTask)
	router.POST("/tasks/clear", h.ClearTasks)
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