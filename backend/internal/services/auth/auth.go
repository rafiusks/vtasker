package auth

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/rafaelzasas/vtasker/backend/internal/models/user"
	"github.com/rafaelzasas/vtasker/backend/internal/repository"
	"github.com/rafaelzasas/vtasker/backend/internal/services/jwt"
)

// Service handles authentication operations
type Service struct {
	userRepo   repository.UserRepository
	jwtService *jwt.Service
}

// NewService creates a new auth service
func NewService(userRepo repository.UserRepository, jwtService *jwt.Service) *Service {
	return &Service{
		userRepo:   userRepo,
		jwtService: jwtService,
	}
}

// TokenPair represents an access and refresh token pair
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// RegisterInput represents the input for user registration
type RegisterInput struct {
	Email     string       `json:"email" validate:"required,email"`
	Username  string       `json:"username" validate:"required,min=3,max=50"`
	Password  string       `json:"password" validate:"required,min=8"`
	FullName  string       `json:"full_name,omitempty"`
	AvatarURL string       `json:"avatar_url,omitempty"`
	Role      user.UserRole `json:"role,omitempty"`
}

// LoginInput represents the input for user login
type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// Register creates a new user account
func (s *Service) Register(ctx context.Context, input RegisterInput) (*user.User, error) {
	// Check if email is already taken
	existingUser, err := s.userRepo.GetByEmail(ctx, input.Email)
	if err != nil && err != repository.ErrNotFound {
		return nil, fmt.Errorf("failed to check email: %w", err)
	}
	if existingUser != nil {
		return nil, repository.ErrDuplicate
	}

	// Check if username is already taken
	existingUser, err = s.userRepo.GetByUsername(ctx, input.Username)
	if err != nil && err != repository.ErrNotFound {
		return nil, fmt.Errorf("failed to check username: %w", err)
	}
	if existingUser != nil {
		return nil, repository.ErrDuplicate
	}

	// Create user
	newUser, err := user.New(user.CreateInput{
		Email:     input.Email,
		Username:  input.Username,
		Password:  input.Password,
		FullName:  input.FullName,
		AvatarURL: input.AvatarURL,
		Role:      input.Role,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Save user to database
	if err := s.userRepo.Create(ctx, newUser); err != nil {
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	return newUser, nil
}

// Login authenticates a user and returns a token pair
func (s *Service) Login(ctx context.Context, input LoginInput) (*TokenPair, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, input.Email)
	if err != nil {
		if err == repository.ErrNotFound {
			return nil, repository.ErrUnauthorized
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Validate password
	if !user.ValidatePassword(input.Password) {
		return nil, repository.ErrUnauthorized
	}

	// Generate tokens
	accessToken, err := s.jwtService.GenerateAccessToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.jwtService.GenerateRefreshToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Update last login time
	if err := s.userRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		// Log error but don't fail the login
		fmt.Printf("failed to update last login: %v\n", err)
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

// RefreshToken refreshes an access token using a refresh token
func (s *Service) RefreshToken(ctx context.Context, refreshToken string) (*TokenPair, error) {
	// Validate refresh token
	userID, err := s.jwtService.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, repository.ErrUnauthorized
	}

	// Get user
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		if err == repository.ErrNotFound {
			return nil, repository.ErrUnauthorized
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Generate new tokens
	accessToken, err := s.jwtService.GenerateAccessToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	newRefreshToken, err := s.jwtService.GenerateRefreshToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

// ValidateToken validates an access token and returns the associated user
func (s *Service) ValidateToken(ctx context.Context, accessToken string) (*user.User, error) {
	// Validate token
	claims, err := s.jwtService.ValidateAccessToken(accessToken)
	if err != nil {
		return nil, repository.ErrUnauthorized
	}

	// Get user
	user, err := s.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		if err == repository.ErrNotFound {
			return nil, repository.ErrUnauthorized
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// ChangePassword changes a user's password
func (s *Service) ChangePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
	// Get user
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		if err == repository.ErrNotFound {
			return repository.ErrUnauthorized
		}
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Validate current password
	if !user.ValidatePassword(currentPassword) {
		return repository.ErrUnauthorized
	}

	// Update password
	if err := user.UpdatePassword(newPassword); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Save changes
	if err := s.userRepo.Update(ctx, user); err != nil {
		return fmt.Errorf("failed to save user: %w", err)
	}

	return nil
} 