package db

import (
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// Migrate runs database migrations in the specified direction
func Migrate(dbURL string, direction string) error {
	// Create a new migrate instance
	m, err := migrate.New(
		"file://db/migrations",
		dbURL,
	)
	if err != nil {
		return fmt.Errorf("error creating migrate instance: %w", err)
	}
	defer m.Close()

	// Check if database is dirty
	version, dirty, err := m.Version()
	if err != nil && err != migrate.ErrNilVersion {
		return fmt.Errorf("error checking migration version: %w", err)
	}

	if dirty {
		log.Printf("Database is dirty at version %d, forcing version", version)
		if err := m.Force(0); err != nil {
			return fmt.Errorf("error forcing version: %w", err)
		}
	}

	// Run migrations
	if direction == "up" {
		// Force version to 0 if dirty and no version
		if dirty && version == 0 {
			if err := m.Force(0); err != nil {
				return fmt.Errorf("error forcing version: %w", err)
			}
		}
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			return fmt.Errorf("error running migrations up: %w", err)
		}
		log.Println("Successfully ran migrations up")
	} else if direction == "down" {
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
			return fmt.Errorf("error running migrations down: %w", err)
		}
		log.Println("Successfully ran migrations down")
	} else {
		return fmt.Errorf("invalid direction: %s. Must be 'up' or 'down'", direction)
	}

	return nil
} 