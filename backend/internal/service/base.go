package service

import (
	"github.com/vtasker/internal/config"
)

// BaseService provides common functionality for all services
type BaseService struct {
    config *config.Config
}

// NewBaseService creates a new base service with configuration
func NewBaseService(cfg *config.Config) BaseService {
    return BaseService{
        config: cfg,
    }
}

// GetConfig returns the service configuration
func (s *BaseService) GetConfig() *config.Config {
    return s.config
} 