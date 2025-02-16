package config

import (
	"os"
	"path"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	// Server settings
	Port        string
	APIBasePath string

	// Database settings
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// Redis settings
	RedisHost string
	RedisPort string

	// JWT settings
	JWTSecret     string
	JWTExpiration string
}

var cfg *Config

// Load initializes configuration from environment variables
func Load() (*Config, error) {
	if cfg != nil {
		return cfg, nil
	}

	// Load .env file if it exists
	godotenv.Load()

	cfg = &Config{
		// Server settings
		Port:        getEnv("PORT", "8080"),
		APIBasePath: getEnv("API_BASE_PATH", "/api/v1"),

		// Database settings
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "vtasker"),
		DBPassword: getEnv("DB_PASSWORD", "vtasker_dev"),
		DBName:     getEnv("DB_NAME", "vtasker"),

		// Redis settings
		RedisHost: getEnv("REDIS_HOST", "localhost"),
		RedisPort: getEnv("REDIS_PORT", "6379"),

		// JWT settings
		JWTSecret:     getEnv("JWT_SECRET", "your-256-bit-secret"),
		JWTExpiration: getEnv("JWT_EXPIRATION", "24h"),
	}

	return cfg, nil
}

// Get returns the current configuration
func Get() *Config {
	if cfg == nil {
		cfg, _ = Load()
	}
	return cfg
}

// GetAPIPath returns the full API path for a given endpoint
func (c *Config) GetAPIPath(endpoint string) string {
	return path.Join(c.APIBasePath, endpoint)
}

// Helper function to get environment variables with fallback
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
} 