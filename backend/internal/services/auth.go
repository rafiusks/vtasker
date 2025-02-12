package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/rafaelzasas/vtasker/backend/internal/models/user"
	"github.com/rafaelzasas/vtasker/backend/internal/repository/postgres"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserExists        = errors.New("user already exists")
	ErrInvalidToken      = errors.New("invalid token")
	ErrTokenExpired      = errors.New("token expired")
)

type AuthService struct {
	db        *pgxpool.Pool
	jwtSecret []byte
}

func NewAuthService(db *pgxpool.Pool, jwtSecret string) *AuthService {
	return &AuthService{
		db:        db,
		jwtSecret: []byte(jwtSecret),
	}
}

type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken      string        `json:"token"`
	RefreshToken     string        `json:"refresh_token"`
	ExpiresIn        int64         `json:"expires_in"`
	RefreshExpiresIn int64         `json:"refresh_expires_in"`
	User             *user.User    `json:"user"`
}

func (s *AuthService) Register(ctx context.Context, input user.CreateInput) (*user.User, error) {
	// Check if user exists
	var exists bool
	err := s.db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", input.Email).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrUserExists
	}

	// Get default role ID
	var defaultRoleID int
	err = s.db.QueryRow(ctx, "SELECT id FROM user_roles WHERE code = $1", user.RoleCodeUser).Scan(&defaultRoleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get default role ID: %w", err)
	}

	// Create user
	newUser, err := user.New(input, defaultRoleID)
	if err != nil {
		return nil, err
	}

	// Save user to database
	userRepo := postgres.NewUserRepository(s.db)
	if err := userRepo.Create(ctx, newUser); err != nil {
		return nil, err
	}

	return newUser, nil
}

func (s *AuthService) Login(ctx context.Context, input user.LoginInput) (*TokenPair, error) {
	userRepo := postgres.NewUserRepository(s.db)
	u, err := userRepo.GetByEmail(ctx, input.Email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// Verify password
	if !u.ValidatePassword(input.Password) {
		return nil, ErrInvalidCredentials
	}

	// Validate and ensure super admin role
	if err := userRepo.ValidateAndEnsureSuperAdmin(ctx, u); err != nil {
		return nil, fmt.Errorf("failed to validate super admin: %w", err)
	}

	// Load role information if not already loaded
	if u.Role == nil {
		var role user.UserRole
		err = s.db.QueryRow(ctx, `
			SELECT id, code, name, description, created_at, updated_at
			FROM user_roles WHERE id = $1
		`, u.RoleID).Scan(
			&role.ID, &role.Code, &role.Name, &role.Description,
			&role.CreatedAt, &role.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to load role information: %w", err)
		}
		u.Role = &role
	}

	// Generate token pair
	tokenPair, err := s.generateTokenPair(u)
	if err != nil {
		return nil, err
	}

	// Update last login time
	if err := userRepo.UpdateLastLogin(ctx, u.ID); err != nil {
		return nil, err
	}

	return tokenPair, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*TokenPair, error) {
	// Parse and validate refresh token
	claims, err := s.ValidateToken(refreshToken)
	if err != nil {
		return nil, err
	}

	// Get user from database
	userRepo := postgres.NewUserRepository(s.db)
	user, err := userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, ErrInvalidToken
	}

	// Generate new token pair
	return s.generateTokenPair(user)
}

func (s *AuthService) generateTokenPair(user *user.User) (*TokenPair, error) {
	// Generate access token
	accessTokenExpiry := time.Now().Add(15 * time.Minute)
	accessClaims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(accessTokenExpiry),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	signedAccessToken, err := accessToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, err
	}

	// Generate refresh token
	refreshTokenExpiry := time.Now().Add(7 * 24 * time.Hour)
	refreshClaims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(refreshTokenExpiry),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:      signedAccessToken,
		RefreshToken:     signedRefreshToken,
		ExpiresIn:       int64(accessTokenExpiry.Sub(time.Now()).Seconds()),
		RefreshExpiresIn: int64(refreshTokenExpiry.Sub(time.Now()).Seconds()),
		User:            user,
	}, nil
}

func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return s.jwtSecret, nil
	})
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}

// GetUserByID retrieves a user by their ID
func (s *AuthService) GetUserByID(ctx context.Context, userID uuid.UUID) (*user.User, error) {
	userRepo := postgres.NewUserRepository(s.db)
	return userRepo.GetByID(ctx, userID)
}