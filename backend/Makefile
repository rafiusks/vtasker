.PHONY: dev build test clean

# Development server with hot reload
dev:
	air

# Build the application
build:
	go build -o ./bin/api ./cmd/api

# Run tests
test:
	go test -v ./...

# Clean build artifacts
clean:
	rm -rf ./bin ./tmp 