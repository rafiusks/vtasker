package db

import (
	"errors"
	"fmt"
	"log"
	"os"
	"strconv"

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

	// Check if we need to force a version
	forceVersion := os.Getenv("FORCE_VERSION")
	if forceVersion != "" {
		version, err := strconv.ParseUint(forceVersion, 10, 32)
		if err != nil {
			return fmt.Errorf("invalid force version: %v", err)
		}
		if err := m.Force(int(version)); err != nil {
			return fmt.Errorf("error forcing version: %v", err)
		}
		log.Printf("Successfully forced version to %d", version)
		return nil
	}

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