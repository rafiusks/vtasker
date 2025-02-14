package config

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/vtasker/pkg/logger"
)

// Config holds all configuration for the application
type Config struct {
	Port     string
	LogLevel string
}

// Load loads the configuration from environment variables
func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		logger.Debug("No .env file found", map[string]interface{}{
			"error": err.Error(),
		})
	}

	config := &Config{
		Port:     getEnv("PORT", "8080"),
		LogLevel: getEnv("LOG_LEVEL", "info"),
	}

	return config
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
} 