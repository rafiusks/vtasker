package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/backend/internal/models/user"
	"github.com/rafaelzasas/vtasker/backend/internal/repository"
	"github.com/rafaelzasas/vtasker/backend/internal/repository/postgres"
)

type UserHandler struct {
	repo repository.UserRepository
}

func NewUserHandler(pool *pgxpool.Pool) *UserHandler {
	return &UserHandler{
		repo: postgres.NewUserRepository(pool),
	}
}

// Register registers all user routes
func (h *UserHandler) Register(router *gin.RouterGroup) {
	users := router.Group("/users")
	{
		users.GET("", h.ListUsers)
		users.GET("/:id", h.GetUser)
		users.PATCH("/:id", h.UpdateUser)
		users.DELETE("/:id", h.DeleteUser)
		users.GET("/search", h.SearchUsers)
	}
}

// ListUsers returns a list of all users (super admin only)
func (h *UserHandler) ListUsers(c *gin.Context) {
	// Get user from context
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

	// Get the current user to check if they are a super admin
	currentUser, err := h.repo.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !currentUser.IsSuperAdmin() {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	users, err := h.repo.List(c.Request.Context(), repository.UserFilter{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

// GetUser returns a user by ID (super admin only)
func (h *UserHandler) GetUser(c *gin.Context) {
	// Get user from context
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

	// Get the current user to check if they are a super admin
	currentUser, err := h.repo.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !currentUser.IsSuperAdmin() {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get the requested user
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	foundUser, err := h.repo.GetByID(c.Request.Context(), targetID)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, foundUser)
}

// UpdateUser updates a user (super admin only)
func (h *UserHandler) UpdateUser(c *gin.Context) {
	// Get user from context
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

	// Get the current user to check if they are a super admin
	currentUser, err := h.repo.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !currentUser.IsSuperAdmin() {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get the user to update
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var input user.UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userToUpdate, err := h.repo.GetByID(c.Request.Context(), targetID)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Update user fields
	if input.Email != nil {
		userToUpdate.Email = *input.Email
	}
	if input.FullName != nil {
		userToUpdate.FullName = *input.FullName
	}
	if input.AvatarURL != nil {
		userToUpdate.AvatarURL = *input.AvatarURL
	}
	if input.Password != nil {
		if err := userToUpdate.UpdatePassword(*input.Password); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	if input.RoleID != nil {
		userToUpdate.RoleID = *input.RoleID
	}

	// Save changes
	if err := h.repo.Update(c.Request.Context(), userToUpdate); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, userToUpdate)
}

// DeleteUser deletes a user (super admin only)
func (h *UserHandler) DeleteUser(c *gin.Context) {
	// Get user from context
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

	// Get the current user to check if they are a super admin
	currentUser, err := h.repo.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !currentUser.IsSuperAdmin() {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Delete the target user
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if err := h.repo.Delete(c.Request.Context(), targetID); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// SearchUsers searches for users by query (super admin only)
func (h *UserHandler) SearchUsers(c *gin.Context) {
	// Get user from context
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

	// Get the current user to check if they are a super admin
	currentUser, err := h.repo.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !currentUser.IsSuperAdmin() {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "search query is required"})
		return
	}

	users, err := h.repo.List(c.Request.Context(), repository.UserFilter{Search: query})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
} 