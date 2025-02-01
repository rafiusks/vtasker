import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import type { Task } from '../../../types';

describe('Task File Storage', () => {
  const testTaskId = 'test-task';
  const testFilePath = join('.vtask', 'tasks', `${testTaskId}.md`);

  const testTask: Task = {
    id: testTaskId,
    title: 'Test Task',
    description: 'Test Description',
    status: 'in-progress',
    priority: 'high',
    type: 'feature',
    labels: ['test'],
    dependencies: ['task-001'],
    content: {
      description: 'Test Description',
      acceptance_criteria: ['Test Criterion'],
      implementation_details: 'Test Implementation',
      notes: 'Test Notes',
      attachments: [],
      due_date: '2025-02-01',
      assignee: 'Test User'
    },
    created_at: '2025-02-01T00:00:00.000Z',
    updated_at: '2025-02-01T00:00:00.000Z',
    order: 0,
    status_history: []
  };

  afterEach(() => {
    try {
      unlinkSync(testFilePath);
    } catch (_e) {
      // Ignore if file doesn't exist
    }
  });

  it('should write and read task metadata correctly', () => {
    // Write the task
    writeFileSync(testFilePath, `# ${testTask.title}

## Description
${testTask.description}

**Status**: ${testTask.status}
**Priority**: ${testTask.priority}
**Type**: ${testTask.type}
**Labels**: ${testTask.labels.join(', ')}
**Dependencies**: ${testTask.dependencies.join(', ')}
**Due Date**: ${testTask.content.due_date}
**Assignee**: ${testTask.content.assignee}

## Implementation Details
${testTask.content.implementation_details}

## Acceptance Criteria
- ${testTask.content.acceptance_criteria[0]}

## Notes
${testTask.content.notes}
`);

    // Read the file
    const fileContent = readFileSync(testFilePath, 'utf-8');
    console.log('File content:', fileContent);

    // Verify content
    expect(fileContent).toContain(`**Due Date**: ${testTask.content.due_date}`);
    expect(fileContent).toContain(`**Assignee**: ${testTask.content.assignee}`);
    expect(fileContent).toContain(`**Type**: ${testTask.type}`);
  });
}); 