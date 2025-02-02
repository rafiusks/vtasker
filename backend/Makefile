BINARY_NAME=vtasker

.PHONY: build
build:
	go build -o bin/$(BINARY_NAME) cmd/main.go

.PHONY: run
run:
	go run cmd/main.go

.PHONY: migrate-up
migrate-up:
	go run cmd/migrate/main.go -direction up

.PHONY: migrate-down
migrate-down:
	go run cmd/migrate/main.go -direction down

.PHONY: new-migration
new-migration:
	@read -p "Enter migration name: " name; \
	migrate create -ext sql -dir db/migrations -seq $$name

.PHONY: test
test:
	go test -v ./... 