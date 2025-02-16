package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"github.com/vtasker/internal/auth"
	"github.com/vtasker/internal/config"
	"github.com/vtasker/internal/handler"
	"github.com/vtasker/internal/repository"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize router
	r := chi.NewRouter()

	// Add logging middleware
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == "POST" {
				var body bytes.Buffer
				if _, err := io.Copy(&body, r.Body); err != nil {
					log.Printf("Error reading body: %v", err)
					http.Error(w, "can't read body", http.StatusBadRequest)
					return
				}
				r.Body = io.NopCloser(&body)
				log.Printf("Request body: %s", body.String())
			}
			next.ServeHTTP(w, r)
		})
	})

	// Configure CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	// Initialize database connection
	dbConnStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)
	db, err := sql.Open("postgres", dbConnStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize Redis client
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	// Initialize repositories and services
	userRepo := repository.NewUserRepository(db)
	sessionStore := auth.NewRedisSessionStore(rdb)

	// Initialize handlers
	h := handler.NewHandler(userRepo, sessionStore, db, cfg)
	
	// Mount routes
	r.Mount("/", h.Routes())

	// Start server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatal(err)
	}
} 