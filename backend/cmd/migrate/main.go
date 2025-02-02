package main

import (
	"flag"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/rafaelzasas/vtasker/internal/db"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Parse command line flags
	direction := flag.String("direction", "up", "Migration direction (up or down)")
	flag.Parse()

	if *direction != "up" && *direction != "down" {
		log.Fatalf("Invalid direction: %s. Must be 'up' or 'down'", *direction)
	}

	// Run migrations
	if err := db.RunMigrations(*direction); err != nil {
		log.Fatalf("Error running migrations: %v", err)
		os.Exit(1)
	}
} 