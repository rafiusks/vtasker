package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rafaelzasas/vtasker/backend/internal/models/user"
	"github.com/rafaelzasas/vtasker/backend/internal/repository"
	"github.com/rafaelzasas/vtasker/backend/internal/services/jwt"
)

// AuthMiddleware creates a Gin middleware for authentication
func AuthMiddleware(jwtService *jwt.Service, userRepo repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			return
		}

		// Check if the header has the Bearer prefix
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header"})
			return
		}

		// Validate the token
		claims, err := jwtService.ValidateAccessToken(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		// Get user from database
		user, err := userRepo.GetByID(c.Request.Context(), claims.UserID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
			return
		}

		// Store user in context
		c.Set("user", user)
		c.Next()
	}
}

// RequireRole creates a Gin middleware for role-based authorization
func RequireRole(roles ...user.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context
		userValue, exists := c.Get("user")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user not found in context"})
			return
		}

		user, ok := userValue.(*user.User)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "invalid user type in context"})
			return
		}

		// Check if user has one of the required roles
		hasRole := false
		for _, role := range roles {
			if user.Role == role {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
			return
		}

		c.Next()
	}
}

// GetCurrentUser gets the current user from the Gin context
func GetCurrentUser(c *gin.Context) (*user.User, error) {
	userValue, exists := c.Get("user")
	if !exists {
		return nil, repository.ErrUnauthorized
	}

	user, ok := userValue.(*user.User)
	if !ok {
		return nil, repository.ErrInternal
	}

	return user, nil
}

// RequireAdmin is a shorthand middleware for requiring admin role
func RequireAdmin() gin.HandlerFunc {
	return RequireRole(user.UserRoleAdmin)
}

// RequireOwnerOrAdmin creates a middleware that checks if the user is either the owner of a resource or an admin
func RequireOwnerOrAdmin(getResourceOwnerID func(*gin.Context) (string, error)) gin.HandlerFunc {
	return func(c *gin.Context) {
		currentUser, err := GetCurrentUser(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		// Admins can access any resource
		if currentUser.IsAdmin() {
			c.Next()
			return
		}

		// Get the resource owner ID
		ownerID, err := getResourceOwnerID(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "failed to get resource owner"})
			return
		}

		// Check if the current user is the owner
		if currentUser.ID.String() != ownerID {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
			return
		}

		c.Next()
	}
} 