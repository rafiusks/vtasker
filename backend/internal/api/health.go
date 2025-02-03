package api

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func (h *TaskHandler) HealthCheck(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	health := gin.H{
		"status": "ok",
		"checks": gin.H{},
	}

	// Database check
	dbErr := h.repo.Ping(ctx)
	health["checks"].(gin.H)["database"] = map[string]interface{}{
		"status":  ternary(dbErr == nil, "ok", "failed"),
		"message": ternary(dbErr == nil, "", dbErr.Error()),
	}

	if dbErr != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "unhealthy",
			"error":  dbErr.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, health)
}

func ternary(condition bool, a, b interface{}) interface{} {
	if condition {
		return a
	}
	return b
} 