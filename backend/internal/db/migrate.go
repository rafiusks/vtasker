package db

import (
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// RunMigrations runs database migrations
func RunMigrations(direction string) error {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Construct connection string from individual parameters
		dbHost := os.Getenv("DB_HOST")
		if dbHost == "" {
			dbHost = "localhost"
		}
		dbPort := os.Getenv("DB_PORT")
		if dbPort == "" {
			dbPort = "5432"
		}
		dbUser := os.Getenv("DB_USER")
		if dbUser == "" {
			dbUser = "postgres"
		}
		dbPass := os.Getenv("DB_PASSWORD")
		if dbPass == "" {
			dbPass = "postgres"
		}
		dbName := os.Getenv("DB_NAME")
		if dbName == "" {
			dbName = "vtasker"
		}

		dbURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
			dbUser, dbPass, dbHost, dbPort, dbName)
	}

	m, err := migrate.New(
		"file://db/migrations",
		dbURL,
	)
	if err != nil {
		return fmt.Errorf("error creating migrate instance: %v", err)
	}
	defer m.Close()

	if direction == "down" {
		if err := m.Down(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
			return fmt.Errorf("error running down migrations: %v", err)
		}
		log.Println("Successfully reverted all migrations")
		return nil
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("error running migrations: %v", err)
	}

	log.Println("Successfully ran all migrations")
	return nil
} 