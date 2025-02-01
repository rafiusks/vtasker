# vTasker

A task management system with AI integration.

## Prerequisites

- [Deno](https://deno.land/) v1.41.0 or higher
- Node.js v18 or higher (for the frontend)
- npm v9 or higher (for the frontend)

## Project Structure

```
vtask/
├── .vtask/          # Task storage
├── docs/            # Documentation
├── src/             # Source code
│   ├── api/         # API endpoints
│   ├── components/  # React components
│   ├── converters/  # Data converters
│   ├── storage/     # Storage adapters
│   └── types/       # TypeScript types
└── public/          # Static assets
```

## Development

1. Start the backend server:
```bash
deno task dev
```

2. Start the frontend development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## API Endpoints

### Tasks

- `GET /api/tasks` - List all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Boards

- `GET /api/boards` - List all boards
- `GET /api/boards/:id` - Get a specific board
- `POST /api/boards` - Create a new board
- `PUT /api/boards/:id` - Update a board
- `DELETE /api/boards/:id` - Delete a board

## Testing

Run the tests:
```bash
deno task test
```

## Linting and Formatting

```bash
# Run linter
deno task lint

# Format code
deno task fmt
``` 