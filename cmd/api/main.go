package main

import (
	"fmt"
	"net/http"

	"github.com/vtasker/internal/config"
	"github.com/vtasker/internal/handlers"
	"github.com/vtasker/pkg/logger"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize logger
	logger.Init(cfg.LogLevel)

	// Create router
	router := handlers.NewRouter()

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	logger.Info(fmt.Sprintf("Server starting on port %s", cfg.Port))
	
	if err := http.ListenAndServe(addr, router); err != nil {
		logger.Fatal("Failed to start server", err)
	}
} 