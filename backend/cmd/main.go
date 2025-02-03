package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/internal/api"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../.env"); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Create connection pool configuration
	config, err := pgxpool.ParseConfig(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Error parsing connection config: %v", err)
	}

	// Initialize database connection
	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatal(fmt.Errorf("unable to create connection pool: %w", err))
	}
	defer pool.Close()

	// Add connection check
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := pool.Ping(ctx); err != nil {
		log.Fatal("Database unreachable: ", err)
	}

	// Initialize Gin router
	router := gin.Default()

	// CORS middleware
	configCors := cors.DefaultConfig()
	allowedOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:5173,http://localhost:3000" // Default to development ports
	}
	configCors.AllowOrigins = strings.Split(allowedOrigins, ",")
	configCors.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}
	configCors.AllowHeaders = []string{
		"Origin",
		"Content-Type",
		"Content-Length",
		"Accept-Encoding",
		"X-CSRF-Token",
		"Authorization",
	}
	configCors.ExposeHeaders = []string{
		"Content-Length",
		"Content-Type",
	}
	configCors.AllowCredentials = true
	router.Use(cors.New(configCors))

	// Setup routes
	api.SetupRoutes(router, pool)

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	// Start server
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
} 