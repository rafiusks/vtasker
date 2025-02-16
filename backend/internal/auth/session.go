package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	Token     string    `json:"token"`
	UserAgent string    `json:"userAgent"`
	IPAddress string    `json:"ipAddress"`
	LastUsed  time.Time `json:"lastUsed"`
	ExpiresAt time.Time `json:"expiresAt"`
}

type SessionStore interface {
	CreateSession(ctx context.Context, session *Session) error
	GetSession(ctx context.Context, sessionID string) (*Session, error)
	GetUserSessions(ctx context.Context, userID string) ([]*Session, error)
	UpdateSession(ctx context.Context, session *Session) error
	RevokeSession(ctx context.Context, userID, sessionID string) error
	RevokeAllSessions(ctx context.Context, userID, exceptToken string) error
}

type RedisSessionStore struct {
	client *redis.Client
}

func NewRedisSessionStore(client *redis.Client) SessionStore {
	return &RedisSessionStore{client: client}
}

const (
	sessionKeyPrefix    = "session:"
	userSessionsPrefix = "user_sessions:"
	sessionTTL         = 30 * 24 * time.Hour // 30 days
)

func (s *RedisSessionStore) CreateSession(ctx context.Context, session *Session) error {
	// Store session data
	sessionKey := fmt.Sprintf("%s%s", sessionKeyPrefix, session.ID)
	sessionData, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("failed to marshal session: %w", err)
	}

	// Store in Redis with TTL
	if err := s.client.Set(ctx, sessionKey, sessionData, sessionTTL).Err(); err != nil {
		return fmt.Errorf("failed to store session: %w", err)
	}

	// Add to user's session list
	userSessionsKey := fmt.Sprintf("%s%s", userSessionsPrefix, session.UserID)
	if err := s.client.SAdd(ctx, userSessionsKey, session.ID).Err(); err != nil {
		return fmt.Errorf("failed to add session to user list: %w", err)
	}

	return nil
}

func (s *RedisSessionStore) GetSession(ctx context.Context, sessionID string) (*Session, error) {
	sessionKey := fmt.Sprintf("%s%s", sessionKeyPrefix, sessionID)
	data, err := s.client.Get(ctx, sessionKey).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	var session Session
	if err := json.Unmarshal(data, &session); err != nil {
		return nil, fmt.Errorf("failed to unmarshal session: %w", err)
	}

	return &session, nil
}

func (s *RedisSessionStore) GetUserSessions(ctx context.Context, userID string) ([]*Session, error) {
	userSessionsKey := fmt.Sprintf("%s%s", userSessionsPrefix, userID)
	sessionIDs, err := s.client.SMembers(ctx, userSessionsKey).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get user sessions: %w", err)
	}

	var sessions []*Session
	for _, sessionID := range sessionIDs {
		session, err := s.GetSession(ctx, sessionID)
		if err != nil {
			continue // Skip invalid sessions
		}
		if session != nil {
			sessions = append(sessions, session)
		}
	}

	return sessions, nil
}

func (s *RedisSessionStore) UpdateSession(ctx context.Context, session *Session) error {
	session.LastUsed = time.Now()
	return s.CreateSession(ctx, session) // Reuse create logic with updated data
}

func (s *RedisSessionStore) RevokeSession(ctx context.Context, userID, sessionID string) error {
	// Remove session data
	sessionKey := fmt.Sprintf("%s%s", sessionKeyPrefix, sessionID)
	if err := s.client.Del(ctx, sessionKey).Err(); err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	// Remove from user's session list
	userSessionsKey := fmt.Sprintf("%s%s", userSessionsPrefix, userID)
	if err := s.client.SRem(ctx, userSessionsKey, sessionID).Err(); err != nil {
		return fmt.Errorf("failed to remove session from user list: %w", err)
	}

	return nil
}

func (s *RedisSessionStore) RevokeAllSessions(ctx context.Context, userID, exceptToken string) error {
	sessions, err := s.GetUserSessions(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user sessions: %w", err)
	}

	for _, session := range sessions {
		if session.Token != exceptToken {
			if err := s.RevokeSession(ctx, userID, session.ID); err != nil {
				return fmt.Errorf("failed to revoke session: %w", err)
			}
		}
	}

	return nil
} 