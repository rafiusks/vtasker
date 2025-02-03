# VTasker

VTasker is a modern, Kubernetes-native service management platform that provides a comprehensive solution for managing, monitoring, and maintaining containerized services.

![VTasker Dashboard](docs/images/dashboard.png)

## Features

- 🚀 **Service Management**
  - Deploy, start, stop, and restart services
  - Scale services up/down
  - Monitor service health and metrics
  - Real-time log streaming

- 📊 **Monitoring & Metrics**
  - Real-time resource usage metrics
  - Custom metric collection
  - Prometheus integration
  - Configurable alerts

- 📝 **Logging**
  - Centralized log aggregation
  - Real-time log streaming
  - Log filtering and search
  - Loki integration

- 🔒 **Security**
  - Role-based access control
  - JWT authentication
  - Audit logging
  - Secure API endpoints

- 🔄 **GitOps Ready**
  - Version controlled configurations
  - Automated deployments
  - Rollback support
  - Configuration validation

## Quick Start

### Prerequisites

- Kubernetes cluster (1.21+)
- Go 1.21+
- Node.js 20+
- Docker
- Make

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vtasker.git
cd vtasker
```

2. Install dependencies:
```bash
make install
```

3. Deploy to Kubernetes:
```bash
make deploy
```

4. Access the dashboard:
```bash
# Port forward the service
kubectl port-forward svc/vtasker-dashboard 3000:3000

# Open in browser
open http://localhost:3000
```

## Documentation

- [Architecture Overview](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Development Guide](docs/CONTRIBUTING.md)
- [Security](docs/security.md)

## Development

### Project Status

#### Completed
- ✅ Initial project structure setup
- ✅ Backend API implementation with Go
- ✅ Frontend React application setup
- ✅ Database schema and migrations
- ✅ Basic Dockerfile for production builds
- ✅ Makefile with essential development commands

#### In Progress
- 🔄 Containerization and deployment setup
  - Production Dockerfile (completed)
  - Development environment containerization
  - Docker Compose configuration
  - Kubernetes deployment manifests

#### Next Steps
1. **Development Environment**
   - Create `Dockerfile.dev` for development with hot reloading
   - Set up Docker Compose with:
     - Backend service (Go)
     - Frontend service (React)
     - PostgreSQL database
     - Prometheus (metrics)
     - Loki (logging)

2. **Kubernetes Deployment**
   - Create deployment manifests
   - Configure services and ingress
   - Set up ConfigMaps and Secrets
   - Configure monitoring stack

3. **CI/CD Pipeline**
   - Set up GitHub Actions
   - Configure automated testing
   - Implement deployment automation
   - Add security scanning

### Local Development

1. Start development environment:
```

## Project Structure

```
vtasker/
├── backend/           # Go backend service
│   ├── cmd/          # Application entrypoints
│   ├── internal/     # Internal packages
│   └── migrations/   # Database migrations
├── src/              # Main Vite/React application
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   └── styles/       # Application styles
├── web/              # NextJS admin dashboard
│   ├── src/          # Dashboard components and logic
│   ├── public/       # Static assets
│   └── pages/        # NextJS pages
├── deploy/           # Kubernetes deployment manifests
│   ├── base/         # Base configurations
│   └── overlays/     # Environment-specific overlays
├── docs/             # Documentation
│   ├── api/          # API documentation
│   └── guides/       # User and development guides
└── scripts/          # Development and deployment scripts
```

### Directory Organization

- **Backend (`/backend`)**: Contains all Go service code
  - Clean architecture pattern
  - Internal packages for business logic
  - Database migrations and models

- **Main Application (`/src`)**: Vite/React application
  - Main user-facing application
  - Built with Vite for optimal development experience
  - React components and business logic

- **Admin Dashboard (`/web`)**: NextJS application
  - Project management interface
  - Monitoring and logging dashboard
  - Built with NextJS for optimal admin experience

- **Deployment (`/deploy`)**: Kubernetes resources
  - Base configurations
  - Environment-specific overlays
  - Monitoring and logging setup

- **Documentation (`/docs`)**: Project documentation
  - Architecture overview
  - API specifications
  - Development guides

### Optimization Notes

1. **Main Application Organization (`/src`)**
   - Vite/React application structure
   - Component-based architecture
   - State management for main application features

2. **Admin Dashboard Organization (`/web`)**
   - NextJS pages and components
   - Monitoring and logging integration
   - Project management features

3. **Backend Structure**
   - Clean architecture pattern
   - Clear separation of concerns
   - Efficient dependency management

4. **Development Workflow**
   - Separate development servers for main app and admin
   - Consistent coding standards
   - Automated testing and linting