# VTasker Makefile

# Variables
SHELL := /bin/bash
GO := go
NODE := node
DOCKER := docker
KUBECTL := kubectl

# Project variables
PROJECT_NAME := vtasker
VERSION := $(shell git describe --tags --always --dirty)
REGISTRY := vtasker
IMAGE_NAME := $(REGISTRY)/$(PROJECT_NAME)
IMAGE_TAG := $(VERSION)

# Directories
ROOT_DIR := $(shell pwd)
BACKEND_DIR := $(ROOT_DIR)/backend
MAIN_APP_DIR := $(ROOT_DIR)/src
ADMIN_DIR := $(ROOT_DIR)/web
BUILD_DIR := $(ROOT_DIR)/build

# Development targets
.PHONY: dev
dev: ## Start all development environments
	@echo "Starting all development environments..."
	@make -j3 dev-backend dev-app dev-admin

.PHONY: dev-app
dev-app: ## Start main Vite/React application
	@echo "Starting main application..."
	@cd $(MAIN_APP_DIR) && npm run dev

.PHONY: dev-admin
dev-admin: ## Start NextJS admin dashboard
	@echo "Starting admin dashboard..."
	@cd $(ADMIN_DIR) && npm run dev

.PHONY: dev-backend
dev-backend: ## Start backend in development mode
	@echo "Starting backend..."
	@cd $(BACKEND_DIR) && $(GO) run ./cmd/manager

# Build targets
.PHONY: build
build: build-backend build-app build-admin ## Build all components

.PHONY: build-app
build-app: ## Build main Vite/React application
	@echo "Building main application..."
	@cd $(MAIN_APP_DIR) && npm run build

.PHONY: build-admin
build-admin: ## Build NextJS admin dashboard
	@echo "Building admin dashboard..."
	@cd $(ADMIN_DIR) && npm run build

.PHONY: build-backend
build-backend: ## Build backend
	@echo "Building backend..."
	@cd $(BACKEND_DIR) && $(GO) build -o $(BUILD_DIR)/manager ./cmd/manager

# Docker targets
.PHONY: docker-build
docker-build: docker-build-app docker-build-admin docker-build-backend ## Build all Docker images

.PHONY: docker-build-app
docker-build-app: ## Build main application Docker image
	@echo "Building main application Docker image..."
	@$(DOCKER) build -t $(IMAGE_NAME)-app:$(IMAGE_TAG) -f $(MAIN_APP_DIR)/Dockerfile .
	@$(DOCKER) tag $(IMAGE_NAME)-app:$(IMAGE_TAG) $(IMAGE_NAME)-app:latest

.PHONY: docker-build-admin
docker-build-admin: ## Build admin dashboard Docker image
	@echo "Building admin dashboard Docker image..."
	@$(DOCKER) build -t $(IMAGE_NAME)-admin:$(IMAGE_TAG) -f $(ADMIN_DIR)/Dockerfile .
	@$(DOCKER) tag $(IMAGE_NAME)-admin:$(IMAGE_TAG) $(IMAGE_NAME)-admin:latest

.PHONY: docker-build-backend
docker-build-backend: ## Build backend Docker image
	@echo "Building backend Docker image..."
	@$(DOCKER) build -t $(IMAGE_NAME)-backend:$(IMAGE_TAG) -f $(BACKEND_DIR)/Dockerfile .
	@$(DOCKER) tag $(IMAGE_NAME)-backend:$(IMAGE_TAG) $(IMAGE_NAME)-backend:latest

.PHONY: docker-push
docker-push: docker-push-app docker-push-admin docker-push-backend ## Push all Docker images

.PHONY: docker-push-app
docker-push-app: ## Push main application Docker image
	@$(DOCKER) push $(IMAGE_NAME)-app:$(IMAGE_TAG)
	@$(DOCKER) push $(IMAGE_NAME)-app:latest

.PHONY: docker-push-admin
docker-push-admin: ## Push admin dashboard Docker image
	@$(DOCKER) push $(IMAGE_NAME)-admin:$(IMAGE_TAG)
	@$(DOCKER) push $(IMAGE_NAME)-admin:latest

.PHONY: docker-push-backend
docker-push-backend: ## Push backend Docker image
	@$(DOCKER) push $(IMAGE_NAME)-backend:$(IMAGE_TAG)
	@$(DOCKER) push $(IMAGE_NAME)-backend:latest

# Kubernetes targets
.PHONY: deploy
deploy: ## Deploy to Kubernetes
	@echo "Deploying to Kubernetes..."
	@$(KUBECTL) apply -f deploy/

.PHONY: undeploy
undeploy: ## Remove from Kubernetes
	@echo "Removing from Kubernetes..."
	@$(KUBECTL) delete -f deploy/

# Testing targets
.PHONY: test
test: test-backend test-app test-admin test-integration ## Run all tests

.PHONY: test-app
test-app: ## Run main application tests
	@echo "Running main application tests..."
	@cd $(MAIN_APP_DIR) && npm test

.PHONY: test-admin
test-admin: ## Run admin dashboard tests
	@echo "Running admin dashboard tests..."
	@cd $(ADMIN_DIR) && npm test

.PHONY: test-backend
test-backend: ## Run backend tests
	@echo "Running backend tests..."
	@cd $(BACKEND_DIR) && $(GO) test ./...

.PHONY: test-integration
test-integration: ## Run integration tests
	@echo "Running integration tests..."
	@cd test/integration && $(GO) test ./...

# Lint targets
.PHONY: lint
lint: lint-backend lint-app lint-admin ## Run all linters

.PHONY: lint-app
lint-app: ## Run main application linter
	@echo "Running main application linter..."
	@cd $(MAIN_APP_DIR) && npm run lint

.PHONY: lint-admin
lint-admin: ## Run admin dashboard linter
	@echo "Running admin dashboard linter..."
	@cd $(ADMIN_DIR) && npm run lint

.PHONY: lint-backend
lint-backend: ## Run backend linter
	@echo "Running backend linter..."
	@cd $(BACKEND_DIR) && golangci-lint run ./...

# Clean targets
.PHONY: clean
clean: clean-app clean-admin clean-backend ## Clean all build artifacts

.PHONY: clean-app
clean-app: ## Clean main application build artifacts
	@echo "Cleaning main application..."
	@cd $(MAIN_APP_DIR) && rm -rf dist node_modules

.PHONY: clean-admin
clean-admin: ## Clean admin dashboard build artifacts
	@echo "Cleaning admin dashboard..."
	@cd $(ADMIN_DIR) && rm -rf .next node_modules

.PHONY: clean-backend
clean-backend: ## Clean backend build artifacts
	@echo "Cleaning backend..."
	@rm -rf $(BUILD_DIR)

# Install targets
.PHONY: install
install: install-tools install-deps ## Install all dependencies

.PHONY: install-tools
install-tools: ## Install development tools
	@echo "Installing development tools..."
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

.PHONY: install-deps
install-deps: ## Install all project dependencies
	@echo "Installing project dependencies..."
	@cd $(BACKEND_DIR) && $(GO) mod download
	@cd $(MAIN_APP_DIR) && npm install
	@cd $(ADMIN_DIR) && npm install

# Monitoring stack
.PHONY: install-monitoring
install-monitoring: ## Install monitoring stack
	@echo "Installing monitoring stack..."
	@$(KUBECTL) apply -f deploy/monitoring/

.PHONY: install-logging
install-logging: ## Install logging stack
	@echo "Installing logging stack..."
	@$(KUBECTL) apply -f deploy/logging/

# Help
.PHONY: help
help: ## Display this help screen
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help 