# VTasker

VTasker is a modern task management system built with Go and React, designed to help teams organize and track their work efficiently.

## Features

- 🎯 **Task Management**
  - Create and manage tasks with rich content
  - Organize tasks with statuses, priorities, and types
  - Track task progress and updates
  - Detailed task descriptions and implementation notes
  - Drag-and-drop task organization
  - Task dependencies and relationships
  - Task comments and attachments (coming soon)

- 📋 **Board Management**
  - Create and customize boards
  - Public and private boards
  - Board member management with roles
  - Board settings and configuration
  - Board templates (coming soon)
  - Activity tracking (coming soon)

- 🔒 **User Management**
  - Secure JWT authentication
  - Role-based access control (User, Admin, Super Admin)
  - User profiles and avatars
  - Session management
  - Team management (coming soon)
  - User notifications (coming soon)

- 👑 **Super Admin Features**
  - System-wide user management
  - Global board oversight
  - Access to all boards and tasks
  - User role management
  - System monitoring (coming soon)
  - Audit logging (coming soon)

- 🎨 **Modern UI**
  - Clean and intuitive interface
  - Real-time updates
  - Responsive design
  - Dark/Light mode support
  - Accessibility features
  - Toast notifications
  - Loading states and error handling

## Quick Start

### Prerequisites

- Go 1.21+
- Node.js 20+
- PostgreSQL 15+
- pnpm (for package management)
- Air (for Go hot-reload)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vtasker.git
cd vtasker
```

2. Install Air for Go hot-reload:
```bash
go install github.com/air-verse/air@latest
```

3. Set up the database:
```bash
# Create PostgreSQL database
createdb vtasker

# Run migrations
cd backend
go run cmd/migrate/main.go up
```

4. Configure environment variables:
```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend (.env)
cp .env.example .env
# Edit .env with your configuration
```

5. Install dependencies and start the services:
```bash
# Backend
cd backend
go mod download
go run cmd/main.go

# Frontend
cd ..
pnpm install
pnpm run dev
```

## Project Structure

```
vtasker/
├── backend/                 # Go backend service
│   ├── cmd/                # Application entrypoints
│   │   ├── main.go        # Main server
│   │   └── migrate/       # Database migrations
│   ├── .air.toml          # Air configuration for hot-reload
│   └── internal/          # Internal packages
│       ├── api/           # API handlers
│       ├── auth/          # Authentication
│       ├── config/        # Configuration
│       ├── database/      # Database connection
│       ├── models/        # Data models
│       └── repository/    # Data access
├── src/                    # Frontend React application
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Application pages
│   └── styles/            # TailwindCSS styles
├── e2e/                    # End-to-end tests
│   └── tests/             # Playwright tests
└── docs/                   # Documentation
    ├── database.md        # Database schema
    └── project-todo.md    # Project roadmap
```

## Development Status

### Implemented Features
- ✅ User authentication with JWT
- ✅ Basic task management (CRUD operations)
- ✅ Task categorization (status, priority, type)
- ✅ Board management and sharing
- ✅ User roles and permissions
- ✅ Super admin dashboard
- ✅ Database migrations and schema
- ✅ Frontend foundation with Vite and TailwindCSS
- ✅ E2E testing setup with Playwright

### In Progress
- 🔄 Task content management
- 🔄 Task labels and filtering
- 🔄 Task dependencies
- 🔄 Team collaboration features
- 🔄 Activity logging
- 🔄 System monitoring
- 🔄 API documentation

### Planned Features
- 📋 Task acceptance criteria
- 📊 Task analytics and reporting
- 🔔 Notifications system
- 📱 Mobile responsive design
- 🔄 Real-time updates
- 🔗 Third-party integrations
- 📈 Performance monitoring

## Documentation

- [Database Schema](docs/database.md)
- [Project Todo](docs/project-todo.md)
- API Documentation (coming soon)
- User Guide (coming soon)
- Developer Guide (coming soon)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

- Unit tests: `go test ./...` (backend)
- Integration tests: `go test -tags=integration ./...` (backend)
- E2E tests: `pnpm test` (frontend)
- Component tests: `pnpm test:component` (frontend)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Go](https://golang.org/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Vite](https://vitejs.dev/)
- [Playwright](https://playwright.dev/)

## Development Commands

- Start backend with hot-reload: `cd backend && air` or `air` (if already in backend directory)
- Start frontend development server: `pnpm run dev`
- Run backend tests: `go test ./...`
- Run frontend tests: `pnpm test`
- Run e2e tests: `pnpm test:e2e`