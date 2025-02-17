package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/backend/internal/models"
	"github.com/rafaelzasas/vtasker/backend/internal/models/user"
	"github.com/rafaelzasas/vtasker/backend/internal/repository"
)

type BoardHandler struct {
	repo *repository.BoardRepository
}

func NewBoardHandler(pool *pgxpool.Pool) *BoardHandler {
	return &BoardHandler{
		repo: repository.NewBoardRepository(pool),
	}
}

// ListBoards returns a list of boards accessible by the user
func (h *BoardHandler) ListBoards(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	boards, err := h.repo.ListBoards(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, boards)
}

// GetBoard returns a single board by ID
func (h *BoardHandler) GetBoard(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	board, err := h.repo.GetBoard(c.Request.Context(), c.Param("id"), userID)
	if err != nil {
		if err.Error() == "board not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "board not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, board)
}

// CreateBoard creates a new board
func (h *BoardHandler) CreateBoard(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	var input models.CreateBoardInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	board, err := h.repo.CreateBoard(c.Request.Context(), &input, userID)
	if err != nil {
		if err.Error() == "board name already exists" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, board)
}

// UpdateBoard updates an existing board
func (h *BoardHandler) UpdateBoard(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	var input models.UpdateBoardInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	board, err := h.repo.UpdateBoard(c.Request.Context(), c.Param("id"), &input, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, board)
}

// DeleteBoard deletes a board
func (h *BoardHandler) DeleteBoard(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	// Get the user to check if they are a super admin
	user := c.MustGet("user").(*user.User)
	isSuperAdmin := user.IsSuperAdmin()

	if err := h.repo.DeleteBoard(c.Request.Context(), c.Param("id"), userID, isSuperAdmin); err != nil {
		if err.Error() == "board not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "board not found"})
			return
		}
		if err.Error() == "unauthorized" {
			c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized to delete this board"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// GetBoardBySlug returns a single board by slug
func (h *BoardHandler) GetBoardBySlug(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	board, err := h.repo.GetBoardBySlug(c.Request.Context(), c.Param("slug"), userID)
	if err != nil {
		if err.Error() == "board not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "board not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, board)
}

// Register registers all board routes
func (h *BoardHandler) Register(router *gin.RouterGroup) {
	boards := router.Group("/boards")
	{
		boards.GET("", h.ListBoards)
		boards.POST("", h.CreateBoard)
		boards.GET("/:id", h.GetBoard)
		boards.PUT("/:id", h.UpdateBoard)
		boards.DELETE("/:id", h.DeleteBoard)
	}

	// Add a separate route group for board slugs
	boardSlugs := router.Group("/b")
	{
		boardSlugs.GET("/:slug", h.GetBoardBySlug)
	}
} 