# Development Commands
.PHONY: help install dev build test clean docker-up docker-down migrate-up migrate-down migrate-create lint format

# Show help
help:
	@echo "vTasker Development Commands"
	@echo "--------------------------"
	@echo "make install     - Install all dependencies for frontend and backend"
	@echo "make dev        - Start all development servers"
	@echo "make build      - Build both frontend and backend"
	@echo "make test       - Run all tests"
	@echo "make clean      - Clean build artifacts"
	@echo "make docker-up  - Start Docker services (PostgreSQL and Redis)"
	@echo "make docker-down - Stop Docker services"
	@echo "make lint       - Run linters for frontend and backend"
	@echo "make format     - Format code using Prettier and gofmt"
	@echo ""
	@echo "Database Commands:"
	@echo "make migrate-up     - Apply database migrations"
	@echo "make migrate-down   - Rollback database migrations"
	@echo "make migrate-create - Create a new migration file"

# Installation
install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && go mod download

# Development
dev:
	@echo "Starting development servers..."
	docker-compose up -d
	cd backend && air & cd frontend && npm run dev

# Build
build:
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Building backend..."
	cd backend && go build -o ./bin/api ./cmd/api

# Testing
test:
	@echo "Running frontend tests..."
	cd frontend && npm test
	@echo "Running backend tests..."
	cd backend && go test -v ./...

# Cleanup
clean:
	@echo "Cleaning build artifacts..."
	rm -rf frontend/.next frontend/out backend/bin backend/tmp
	@echo "Cleaning node modules..."
	rm -rf frontend/node_modules

# Docker commands
docker-up:
	@echo "Starting Docker services..."
	docker-compose up -d

docker-down:
	@echo "Stopping Docker services..."
	docker-compose down

# Database migrations
migrate-up:
	@echo "Applying database migrations..."
	cd backend && migrate -path migrations -database "postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable" up

migrate-down:
	@echo "Rolling back database migrations..."
	cd backend && migrate -path migrations -database "postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable" down

migrate-create:
	@echo "Creating new migration..."
	@read -p "Enter migration name: " name; \
	cd backend && migrate create -ext sql -dir migrations -seq $$name

# Code quality
lint:
	@echo "Linting frontend..."
	cd frontend && npm run lint
	@echo "Linting backend..."
	cd backend && golangci-lint run

format:
	@echo "Formatting frontend code..."
	cd frontend && npm run format
	@echo "Formatting backend code..."
	cd backend && go fmt ./... 