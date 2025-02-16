package config

import (
	"os"
	"testing"
)

// TestConfig holds test-specific configuration
type TestConfig struct {
    *Config
}

// NewTestConfig creates a new test configuration
func NewTestConfig() *TestConfig {
    return &TestConfig{
        Config: &Config{
            // Server settings
            Port:        "8081", // Different port for tests
            APIBasePath: "/api/v1",

            // Database settings
            DBHost:     "localhost",
            DBPort:     "5432",
            DBUser:     "vtasker_test",
            DBPassword: "vtasker_test",
            DBName:     "vtasker_test",

            // Redis settings
            RedisHost: "localhost",
            RedisPort: "6379",

            // JWT settings
            JWTSecret:     "test-secret-key",
            JWTExpiration: "1h",
        },
    }
}

// SetupTestEnv sets up the test environment
func SetupTestEnv(t *testing.T) *TestConfig {
    t.Helper()

    // Save current environment
    oldEnv := make(map[string]string)
    envVars := []string{
        "PORT", "API_BASE_PATH",
        "DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME",
        "REDIS_HOST", "REDIS_PORT",
        "JWT_SECRET", "JWT_EXPIRATION",
    }

    for _, env := range envVars {
        oldEnv[env] = os.Getenv(env)
    }

    // Set test environment
    cfg := NewTestConfig()
    os.Setenv("PORT", cfg.Port)
    os.Setenv("API_BASE_PATH", cfg.APIBasePath)
    os.Setenv("DB_HOST", cfg.DBHost)
    os.Setenv("DB_PORT", cfg.DBPort)
    os.Setenv("DB_USER", cfg.DBUser)
    os.Setenv("DB_PASSWORD", cfg.DBPassword)
    os.Setenv("DB_NAME", cfg.DBName)
    os.Setenv("REDIS_HOST", cfg.RedisHost)
    os.Setenv("REDIS_PORT", cfg.RedisPort)
    os.Setenv("JWT_SECRET", cfg.JWTSecret)
    os.Setenv("JWT_EXPIRATION", cfg.JWTExpiration)

    // Cleanup function
    t.Cleanup(func() {
        for env, value := range oldEnv {
            if value == "" {
                os.Unsetenv(env)
            } else {
                os.Setenv(env, value)
            }
        }
    })

    return cfg
}

// CreateTestDatabase creates a test database
func (tc *TestConfig) CreateTestDatabase(t *testing.T) {
    t.Helper()
    // Implementation for creating test database
    // This would typically involve:
    // 1. Creating a new database
    // 2. Running migrations
    // 3. Setting up test data
}

// CleanupTestDatabase cleans up the test database
func (tc *TestConfig) CleanupTestDatabase(t *testing.T) {
    t.Helper()
    // Implementation for cleaning up test database
    // This would typically involve:
    // 1. Truncating all tables
    // 2. Or dropping the test database
} 