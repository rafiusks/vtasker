package main

import (
	"fmt"
	"net/http"
	"os"
	"runtime"

	"github.com/vtasker/internal/config"
	"github.com/vtasker/internal/handlers"
	"github.com/vtasker/pkg/logger"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize logger
	logger.Init(cfg.LogLevel)

	// Log startup information
	logger.Info("Starting vTasker API", map[string]interface{}{
		"version":    "1.0.0",
		"go_version": runtime.Version(),
		"os":        runtime.GOOS,
		"arch":      runtime.GOARCH,
		"pid":       os.Getpid(),
		"port":      cfg.Port,
		"log_level": cfg.LogLevel,
	})

	// Create router
	router := handlers.NewRouter()

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	logger.Info("Server listening", map[string]interface{}{
		"address": addr,
	})
	
	if err := http.ListenAndServe(addr, router); err != nil {
		logger.Fatal("Failed to start server", err, map[string]interface{}{
			"address": addr,
		})
	}
} 