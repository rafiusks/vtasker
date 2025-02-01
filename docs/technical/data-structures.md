# Data Structures

This document outlines the core data structures used in vTask, with a focus on AI-friendly formats and integration points.

## Task Schema

Tasks are stored as markdown files with YAML frontmatter:

```yaml
---
id: task-001
title: "Implement Core Features"
status: in-progress
priority: high
type: feature
created_at: "2024-03-20T10:00:00Z"
updated_at: "2024-03-21T15:30:00Z"
assignee: "username"
labels: ["core", "backend"]
dependencies: ["task-002", "task-003"]
parent: "epic-001"
---

Task description in markdown...
```

### Task Properties

| Property | Type | Description | AI Usage |
|----------|------|-------------|-----------|
| id | string | Unique task identifier | Reference key |
| title | string | Task title | Text analysis |
| status | enum | One of: backlog, in-progress, review, done | State tracking |
| priority | enum | One of: low, normal, high | Priority analysis |
| type | enum | One of: feature, bug, docs, chore | Classification |
| created_at | ISO date | Creation timestamp | Temporal analysis |
| updated_at | ISO date | Last update timestamp | Activity tracking |
| assignee | string | Username of assignee | Resource analysis |
| labels | string[] | Array of labels | Categorization |
| dependencies | string[] | Array of task IDs | Graph analysis |
| parent | string | Parent task ID | Hierarchy analysis |

## Board Schema

Boards are configured using JSON:

```json
{
  "id": "board-001",
  "name": "Main Board",
  "columns": [
    {
      "id": "col-1",
      "name": "Backlog",
      "limit": 0,
      "status": "backlog"
    },
    {
      "id": "col-2",
      "name": "In Progress",
      "limit": 5,
      "status": "in-progress"
    }
  ],
  "filters": [
    {
      "id": "filter-1",
      "name": "High Priority",
      "conditions": [
        {
          "field": "priority",
          "operator": "equals",
          "value": "high"
        }
      ]
    }
  ]
}
```

## AI Integration Points

### 1. Task Analysis
```typescript
interface TaskAnalysis {
  complexity: number;      // 1-10 scale
  estimatedTime: string;   // e.g. "2h", "3d"
  suggestedLabels: string[];
  relatedTasks: string[];
}
```

### 2. Board Optimization
```typescript
interface BoardOptimization {
  suggestedColumnLimits: Record<string, number>;
  workloadDistribution: Record<string, number>;
  bottleneckAnalysis: {
    column: string;
    reason: string;
    suggestion: string;
  }[];
}
```

### 3. Documentation Analysis
```typescript
interface DocAnalysis {
  completeness: number;    // 0-100%
  clarity: number;         // 0-100%
  suggestedImprovements: string[];
  missingTopics: string[];
}
```

## Data Validation

All data structures are validated using [Zod](https://github.com/colinhacks/zod) schemas. Example:

```typescript
const TaskSchema = z.object({
  id: z.string().regex(/^task-\d+$/),
  title: z.string().min(1).max(200),
  status: z.enum(['backlog', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'normal', 'high']),
  // ... other fields
});
```

## Best Practices

1. **Immutability**: Never modify task files directly. Create new versions.
2. **Validation**: Always validate data before processing.
3. **Timestamps**: Use ISO 8601 format for all dates.
4. **IDs**: Use predictable, URL-safe formats for IDs.
5. **References**: Always validate references between entities. 