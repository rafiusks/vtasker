package main

import (
	"flag"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/rafaelzasas/vtasker/backend/internal/db"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Parse command line flags
	direction := flag.String("direction", "up", "Migration direction (up or down)")
	flag.Parse()

	// Get database URL from environment
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Run migrations
	if err := db.Migrate(dbURL, *direction); err != nil {
		log.Fatal(err)
	}
} 