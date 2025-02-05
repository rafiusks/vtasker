# Contributing to VTasker

We love your input! We want to make contributing to VTasker as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Local Development Setup

### Prerequisites

- Go 1.21+
- Node.js 20+
- Docker
- Kubernetes cluster (local like minikube/kind or remote)
- Make

### Setting Up Development Environment

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vtasker.git
cd vtasker
```

2. Install dependencies:
```bash
# Backend
go mod download

# Frontend
cd web
npm install
cd ..
```

3. Set up local Kubernetes cluster (if not already done):
```bash
# Using kind
kind create cluster --name vtasker

# Or using minikube
minikube start
```

4. Install development dependencies:
```bash
# Install monitoring stack
make install-monitoring

# Install logging stack
make install-logging
```

### Running the Project

1. Start the development environment:
```bash
make dev
```

This will:
- Start the Go backend in development mode
- Start the Next.js frontend in development mode
- Set up port forwarding for Kubernetes services
- Configure hot reloading for both frontend and backend

2. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Metrics: http://localhost:9090
- Logs: http://localhost:3100

## Testing

### Running Tests

```bash
# Run all tests
make test

# Run backend tests only
make test-backend

# Run frontend tests only
make test-frontend

# Run integration tests
make test-integration
```

### Writing Tests

1. Backend tests should be placed in `*_test.go` files next to the code they test
2. Frontend tests should be placed in `__tests__` directories
3. Integration tests should be placed in `test/integration`

## Code Style

### Go Code

- Follow the [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- Use `gofmt` to format your code
- Run `golangci-lint` before submitting PRs

### TypeScript/JavaScript Code

- Follow the project's ESLint configuration
- Use Prettier for formatting
- Follow React best practices and hooks guidelines

## Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update the documentation with any new dependencies or features
3. Increase the version numbers in any examples files and the README.md to the new version
4. The PR will be merged once you have the sign-off of two other developers

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/yourusername/vtasker/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/vtasker/issues/new).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License

By contributing, you agree that your contributions will be licensed under its MIT License. 