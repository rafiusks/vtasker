package config

import (
	"os"
)

// Config holds all configuration values
type Config struct {
	SuperAdminEmail string
}

// Load returns a new Config instance with values loaded from environment
func Load() *Config {
	return &Config{
		SuperAdminEmail: getEnvOrDefault("SUPERADMIN_EMAIL", ""),
	}
}

// getEnvOrDefault returns environment variable value or default if not set
func getEnvOrDefault(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
} 