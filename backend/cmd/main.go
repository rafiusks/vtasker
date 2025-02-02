package main

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rafaelzasas/vtasker/internal/api"
	"github.com/rafaelzasas/vtasker/internal/db"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Initialize database connection
	pool, err := db.Connect(context.Background())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	// Initialize Gin router
	router := gin.Default()

	// CORS middleware
	config := cors.DefaultConfig()
	allowedOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:5173" // Default to Vite's port
	}
	config.AllowOrigins = strings.Split(allowedOrigins, ",")
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

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