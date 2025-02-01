# Development Guide

## Development Setup

### Prerequisites
- Node.js v18+
- npm v9+
- Git

### Getting Started
1. Clone the repository:
```bash
git clone https://github.com/yourusername/vtask.git
cd vtask
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
vtask/
├── .vtask/          # Task storage
├── docs/            # Documentation
├── src/             # Source code
│   ├── components/  # React components
│   ├── routes/      # Application routes
│   ├── hooks/       # Custom React hooks
│   ├── utils/       # Utility functions
│   └── ai/          # AI integration
├── tests/           # Test files
└── scripts/         # Build scripts
```

## Development Workflow

### 1. Creating Components

Components follow this structure:
```tsx
// src/components/TaskCard.tsx
import { type Task } from '../types';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  return (
    <div className="task-card">
      {/* Component content */}
    </div>
  );
}
```

### 2. Adding Routes

Routes are defined in `src/routes/`:
```tsx
// src/routes/tasks/[id].tsx
import { useParams } from 'react-router-dom';
import { useTask } from '../hooks/useTask';

export function TaskPage() {
  const { id } = useParams();
  const { task, loading } = useTask(id);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="task-page">
      {/* Page content */}
    </div>
  );
}
```

### 3. Custom Hooks

Create reusable logic in hooks:
```tsx
// src/hooks/useTask.ts
import { useState, useEffect } from 'react';
import { type Task } from '../types';

export function useTask(id: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load task logic
  }, [id]);

  return { task, loading };
}
```

## Testing

### Unit Tests

```tsx
// tests/components/TaskCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TaskCard } from '../../src/components/TaskCard';

describe('TaskCard', () => {
  it('renders task title', () => {
    const task = {
      id: 'task-1',
      title: 'Test Task'
    };

    render(<TaskCard task={task} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

### Integration Tests

```tsx
// tests/integration/task-workflow.test.tsx
import { test, expect } from '@playwright/test';

test('complete task workflow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="create-task"]');
  // Test workflow steps
});
```

## AI Integration

### 1. Creating Analyzers

```typescript
// src/ai/analyzers/TaskAnalyzer.ts
import { type Task } from '../../types';

export class TaskAnalyzer {
  async analyze(task: Task) {
    return {
      complexity: this.calculateComplexity(task),
      suggestions: await this.generateSuggestions(task)
    };
  }

  private calculateComplexity(task: Task) {
    // Complexity calculation logic
  }

  private async generateSuggestions(task: Task) {
    // AI-powered suggestion generation
  }
}
```

### 2. Adding AI Features

```typescript
// src/ai/features/DocumentationEnhancer.ts
export class DocumentationEnhancer {
  async enhance(content: string) {
    return {
      enhanced: await this.improveContent(content),
      suggestions: this.generateImprovements(content)
    };
  }

  private async improveContent(content: string) {
    // Content improvement logic
  }
}
```

## Build and Deploy

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker build -t vtask .
docker run -p 3000:3000 vtask
```

## Style Guide

### TypeScript
- Use strict mode
- Prefer interfaces over types
- Document public APIs
- Use meaningful variable names

### React
- Use functional components
- Implement proper error boundaries
- Optimize re-renders
- Follow React hooks rules

### CSS
- Use TailwindCSS utilities
- Follow BEM for custom classes
- Maintain responsive design
- Ensure accessibility

## Contributing

1. Fork the repository
2. Create feature branch
3. Write tests
4. Submit pull request

### Commit Messages
```
feat: Add task analysis feature
fix: Resolve board drag issue
docs: Update API documentation
refactor: Improve task loading
```

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Testing Library](https://testing-library.com/docs) 