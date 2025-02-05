# Build the manager binary
FROM golang:1.21 as builder

WORKDIR /workspace
# Copy the Go Modules manifests
COPY go.mod go.mod
COPY go.sum go.sum
# Cache dependencies
RUN go mod download

# Copy the go source
COPY backend/ backend/
COPY api/ api/

# Build
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -o manager backend/cmd/manager/main.go

# Build the frontend
FROM node:20 as frontend-builder

WORKDIR /workspace
COPY web/ ./
RUN npm ci
RUN npm run build

# Use distroless as minimal base image to package the manager binary
# Refer to https://github.com/GoogleContainerTools/distroless for more details
FROM gcr.io/distroless/static:nonroot

WORKDIR /
COPY --from=builder /workspace/manager .
COPY --from=frontend-builder /workspace/dist /web/dist
USER 65532:65532

ENTRYPOINT ["/manager"] 