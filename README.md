# VTasker

VTasker is a modern task management system built with Go and React, designed to help teams organize and track their work efficiently.

## Features

- 🎯 **Task Management**
  - Create and manage tasks with rich content
  - Organize tasks with statuses, priorities, and types
  - Track task progress and updates
  - Detailed task descriptions and implementation notes

- 🔒 **User Management**
  - Secure JWT authentication
  - Role-based access control
  - User profiles and avatars
  - Session management

- 🎨 **Modern UI**
  - Clean and intuitive interface
  - Real-time updates
  - Responsive design
  - Dark/Light mode support

## Quick Start

### Prerequisites

- Go 1.21+
- Node.js 20+
- PostgreSQL 15+
- pnpm (for package management)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vtasker.git
cd vtasker
```

2. Set up the database:
```bash
# Create PostgreSQL database
createdb vtasker
```

3. Start the backend:
```bash
cd backend
go run cmd/main.go
```

4. Start the frontend:
```bash
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
- ✅ Database migrations and schema
- ✅ Frontend foundation with Vite and TailwindCSS

### In Progress
- 🔄 Task content management
- 🔄 Task labels and filtering
- 🔄 Task dependencies
- 🔄 Team collaboration features

### Planned Features
- 📋 Task acceptance criteria
- 📊 Task analytics and reporting
- 🔔 Notifications system
- 📱 Mobile responsive design

## Documentation

- [Database Schema](docs/database.md)
- [Project Todo](docs/project-todo.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.