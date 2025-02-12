package main

import (
	"flag"
	"log"
	"os"
	"strconv"

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

	// Check for force command
	args := flag.Args()
	if len(args) > 0 && args[0] == "force" {
		if len(args) != 2 {
			log.Fatal("force command requires a version number")
		}
		version, err := strconv.Atoi(args[1])
		if err != nil {
			log.Fatal("invalid version number")
		}
		if err := db.Force(dbURL, version); err != nil {
			log.Fatal(err)
		}
		return
	}

	// Run migrations
	if err := db.Migrate(dbURL, *direction); err != nil {
		log.Fatal(err)
	}
} 