package handler

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/vtasker/internal/auth"
	"github.com/vtasker/internal/middleware"
	"github.com/vtasker/internal/models"
	"github.com/vtasker/internal/repository"
)

type AuthHandler struct {
	userRepo     repository.UserRepository
	sessionStore auth.SessionStore
}

func NewAuthHandler(userRepo repository.UserRepository, sessionStore auth.SessionStore) *AuthHandler {
	return &AuthHandler{
		userRepo:     userRepo,
		sessionStore: sessionStore,
	}
}

type CheckEmailRequest struct {
	Email string `json:"email"`
}

type CheckEmailResponse struct {
	Exists bool `json:"exists"`
}

func (h *AuthHandler) CheckEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CheckEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	exists, err := h.userRepo.CheckEmailExists(r.Context(), req.Email)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	response := struct {
		Data CheckEmailResponse `json:"data"`
	}{
		Data: CheckEmailResponse{
			Exists: exists,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

type SignUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type SignUpResponse struct {
	Token string `json:"token"`
	User  struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	} `json:"user"`
}

func (h *AuthHandler) SignUp(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req SignUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate password length
	if len(req.Password) < 8 {
		http.Error(w, "Password must be at least 8 characters long", http.StatusBadRequest)
		return
	}

	// Check if email already exists
	exists, err := h.userRepo.CheckEmailExists(r.Context(), req.Email)
	if err != nil {
		log.Printf("Error checking email existence: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	if exists {
		http.Error(w, "Email already exists", http.StatusConflict)
		return
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Create user
	now := time.Now()
	user := &models.User{
		ID:           uuid.New(),
		Email:        req.Email,
		Name:         req.Name,
		PasswordHash: hashedPassword,
		IsVerified:   false,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := h.userRepo.Create(r.Context(), user); err != nil {
		log.Printf("Error creating user: %v", err)
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Generate JWT token
	secret := []byte(os.Getenv("JWT_SECRET"))
	if len(secret) == 0 {
		secret = []byte("your-256-bit-secret") // Default secret for development
	}

	token, err := auth.GenerateToken(user.ID.String(), user.Email, secret, false)
	if err != nil {
		log.Printf("Error generating token: %v", err)
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Generate response
	response := SignUpResponse{
		Token: token,
		User: struct {
			ID    string `json:"id"`
			Email string `json:"email"`
			Name  string `json:"name"`
		}{
			ID:    user.ID.String(),
			Email: user.Email,
			Name:  user.Name,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

type SignInRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	RememberMe bool   `json:"rememberMe"`
}

type SignInResponse struct {
	Token string `json:"token"`
	User  struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	} `json:"user"`
}

func (h *AuthHandler) SignIn(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req SignInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Find user by email
	user, err := h.userRepo.GetByEmail(r.Context(), req.Email)
	if err != nil || user == nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Check if account is locked
	if user.IsLocked {
		http.Error(w, "Account is locked. Please contact support.", http.StatusForbidden)
		return
	}

	// Verify password
	if !auth.CheckPassword(req.Password, user.PasswordHash) {
		// Increment failed login attempts
		user.FailedLoginAttempts++
		if user.FailedLoginAttempts >= 5 {
			user.IsLocked = true
		}
		if err := h.userRepo.Update(r.Context(), user); err != nil {
			log.Printf("Failed to update failed login attempts: %v", err)
		}
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Reset failed login attempts on successful login
	user.FailedLoginAttempts = 0
	user.LastLoginAt = sql.NullTime{
		Time:  time.Now(),
		Valid: true,
	}
	if err := h.userRepo.Update(r.Context(), user); err != nil {
		log.Printf("Failed to update last login time: %v", err)
	}

	// Generate JWT token
	secret := []byte(os.Getenv("JWT_SECRET"))
	if len(secret) == 0 {
		secret = []byte("your-256-bit-secret") // Default secret for development
	}

	token, err := auth.GenerateToken(user.ID.String(), user.Email, secret, req.RememberMe)
	if err != nil {
		log.Printf("Error generating token: %v", err)
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Create session
	session := &auth.Session{
		ID:        uuid.New().String(),
		UserID:    user.ID.String(),
		Token:     token,
		UserAgent: r.UserAgent(),
		IPAddress: r.RemoteAddr,
		LastUsed:  time.Now(),
		ExpiresAt: time.Now().Add(auth.GetTokenExpiration(req.RememberMe)),
	}

	if err := h.sessionStore.CreateSession(r.Context(), session); err != nil {
		log.Printf("Error creating session: %v", err)
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	response := SignInResponse{
		Token: token,
		User: struct {
			ID    string `json:"id"`
			Email string `json:"email"`
			Name  string `json:"name"`
		}{
			ID:    user.ID.String(),
			Email: user.Email,
			Name:  user.Name,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

type SessionResponse struct {
	ID        string    `json:"id"`
	UserAgent string    `json:"userAgent"`
	IPAddress string    `json:"ipAddress"`
	LastUsed  time.Time `json:"lastUsed"`
	Current   bool      `json:"current"`
}

func (h *AuthHandler) ListSessions(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get sessions from Redis
	sessions, err := h.sessionStore.GetUserSessions(r.Context(), userID)
	if err != nil {
		log.Printf("Error getting sessions: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Get current session token
	currentToken := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")

	// Convert to response format
	var response []SessionResponse
	for _, session := range sessions {
		response = append(response, SessionResponse{
			ID:        session.ID,
			UserAgent: session.UserAgent,
			IPAddress: session.IPAddress,
			LastUsed:  session.LastUsed,
			Current:   session.Token == currentToken,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": response,
	})
}

func (h *AuthHandler) RevokeSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		SessionID string `json:"sessionId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get current session token
	currentToken := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")

	// Check if trying to revoke current session
	session, err := h.sessionStore.GetSession(r.Context(), req.SessionID)
	if err != nil {
		http.Error(w, "Session not found", http.StatusNotFound)
		return
	}

	if session.Token == currentToken {
		http.Error(w, "Cannot revoke current session", http.StatusBadRequest)
		return
	}

	// Revoke the session
	if err := h.sessionStore.RevokeSession(r.Context(), userID, req.SessionID); err != nil {
		log.Printf("Error revoking session: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *AuthHandler) RevokeAllSessions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get current session token
	currentToken := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")

	// Revoke all sessions except current
	if err := h.sessionStore.RevokeAllSessions(r.Context(), userID, currentToken); err != nil {
		log.Printf("Error revoking all sessions: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
} 