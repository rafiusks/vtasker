package service

import (
	"context"
	"database/sql"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/vtasker/internal/config"
	"github.com/vtasker/internal/models"
	"github.com/vtasker/internal/repository"
)

func TestProjectService_CreateProject(t *testing.T) {
    // Setup test environment
    cfg := config.SetupTestEnv(t)
    cfg.CreateTestDatabase(t)
    defer cfg.CleanupTestDatabase(t)

    // Create dependencies
    db := setupTestDB(t)
    repo := repository.NewProjectRepository(db)
    service := NewProjectService(repo, cfg.Config)

    // Test cases
    tests := []struct {
        name    string
        req     models.CreateProjectRequest
        wantErr bool
    }{
        {
            name: "valid project",
            req: models.CreateProjectRequest{
                Name:        "Test Project",
                Description: "Test Description",
            },
            wantErr: false,
        },
        {
            name: "missing name",
            req: models.CreateProjectRequest{
                Description: "Test Description",
            },
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            userID := uuid.New()
            project, err := service.CreateProject(context.Background(), tt.req, userID)

            if tt.wantErr {
                assert.Error(t, err)
                assert.Nil(t, project)
            } else {
                require.NoError(t, err)
                assert.NotNil(t, project)
                assert.Equal(t, tt.req.Name, project.Name)
                assert.Equal(t, tt.req.Description, project.Description)
                assert.Equal(t, userID, project.CreatedBy)
                assert.False(t, project.IsArchived)
            }
        })
    }
}

// setupTestDB creates a test database connection
func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()
    // Implementation for setting up test database connection
    return nil // TODO: Implement actual database connection
} 