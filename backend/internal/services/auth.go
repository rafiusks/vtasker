package services

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/rafaelzasas/vtasker/backend/internal/models"
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
	AccessToken      string             `json:"token"`
	RefreshToken     string             `json:"refresh_token"`
	ExpiresIn        int64              `json:"expires_in"`
	RefreshExpiresIn int64              `json:"refresh_expires_in"`
	User             *models.UserResponse `json:"user"`
}

func (s *AuthService) Register(ctx context.Context, input models.CreateUserInput) (*models.UserResponse, error) {
	// Check if user exists
	var exists bool
	err := s.db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", input.Email).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrUserExists
	}

	// Create user
	user, err := models.NewUser(input)
	if err != nil {
		return nil, err
	}

	// Save user to database
	err = s.db.QueryRow(ctx,
		`INSERT INTO users (id, email, password_hash, name, avatar_url, role, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, email, name, created_at`,
		user.ID, user.Email, user.PasswordHash, user.Name, user.AvatarURL, user.Role, user.CreatedAt, user.UpdatedAt,
	).Scan(&user.ID, &user.Email, &user.Name, &user.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &models.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		CreatedAt: user.CreatedAt,
	}, nil
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func (s *AuthService) Login(ctx context.Context, input LoginInput) (*TokenPair, error) {
	var user models.User
	err := s.db.QueryRow(ctx,
		"SELECT id, email, password_hash, name, created_at FROM users WHERE email = $1",
		input.Email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.CreatedAt)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// Generate token pair
	tokenPair, err := s.generateTokenPair(&user)
	if err != nil {
		return nil, err
	}

	// Update last login time
	_, err = s.db.Exec(ctx,
		"UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1",
		user.ID,
	)
	if err != nil {
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
	var user models.User
	err = s.db.QueryRow(ctx,
		"SELECT id, email, name, created_at FROM users WHERE id = $1",
		claims.UserID,
	).Scan(&user.ID, &user.Email, &user.Name, &user.CreatedAt)
	if err != nil {
		return nil, ErrInvalidToken
	}

	// Generate new token pair
	return s.generateTokenPair(&user)
}

func (s *AuthService) generateTokenPair(user *models.User) (*TokenPair, error) {
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
		User: &models.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Name:      user.Name,
			CreatedAt: user.CreatedAt,
		},
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