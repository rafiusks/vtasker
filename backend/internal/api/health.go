package api

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HealthHandler struct {
	db *pgxpool.Pool
}

func NewHealthHandler(db *pgxpool.Pool) *HealthHandler {
	return &HealthHandler{
		db: db,
	}
}

// Register registers health check routes
func (h *HealthHandler) Register(router *gin.Engine) {
	router.GET("/health", h.HealthCheck)
	router.GET("/api/health", h.HealthCheck) // Also register under /api for consistency
}

// HealthCheck performs a health check of the service and its dependencies
func (h *HealthHandler) HealthCheck(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	health := gin.H{
		"status": "ok",
		"time":   time.Now().UTC(),
		"checks": gin.H{
			"database": gin.H{
				"status": "ok",
			},
		},
	}

	// Check database connection
	if err := h.db.Ping(ctx); err != nil {
		health["status"] = "error"
		health["checks"].(gin.H)["database"] = gin.H{
			"status":  "error",
			"message": err.Error(),
		}
		c.JSON(http.StatusServiceUnavailable, health)
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
