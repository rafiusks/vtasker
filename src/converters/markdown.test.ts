import { assertEquals } from 'std/assert/mod.ts';
import { markdownToTask, taskToMarkdown } from './markdown.ts';
import type { Task } from '../types/index.ts';

const TEST_MARKDOWN = `# Test Task

This is a test task

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Implementation Details
Implementation details here

## Notes
Some notes

**Status**: in-progress
**Priority**: high
**Type**: feature`;

const MINIMAL_MARKDOWN = `# Minimal Task

**Status**: backlog
**Priority**: low
**Type**: chore`;

const METADATA_MARKDOWN = `# Task with Metadata

**Status**: in-progress
**Priority**: high
**Type**: feature
**Parent**: task-001
**Board**: main
**Column**: review`;

Deno.test('markdownToTask - should convert markdown to task object', () => {
  const task = markdownToTask(TEST_MARKDOWN);
  assertEquals(task.title, 'Test Task');
  assertEquals(task.status, 'in-progress');
  assertEquals(task.priority, 'high');
  assertEquals(task.type, 'feature');
  assertEquals(task.content.description, 'This is a test task');
  assertEquals(task.content.acceptance_criteria.length, 2);
  assertEquals(task.content.implementation_details, 'Implementation details here');
  assertEquals(task.content.notes, 'Some notes');
});

Deno.test('markdownToTask - should handle empty sections', () => {
  const task = markdownToTask(MINIMAL_MARKDOWN);
  assertEquals(task.title, 'Minimal Task');
  assertEquals(task.status, 'backlog');
  assertEquals(task.priority, 'low');
  assertEquals(task.type, 'chore');
  assertEquals(task.content.description, '');
  assertEquals(task.content.acceptance_criteria.length, 0);
  assertEquals(task.content.implementation_details, '');
  assertEquals(task.content.notes, '');
});

Deno.test('markdownToTask - should handle optional metadata fields', () => {
  const task = markdownToTask(METADATA_MARKDOWN);
  assertEquals(task.parent, 'task-001');
  assertEquals(task.board, 'main');
  assertEquals(task.column, 'review');
});

Deno.test('taskToMarkdown - should convert task object to markdown', () => {
  const task: Task = {
    id: 'test-001',
    title: 'Test Task',
    status: 'in-progress',
    priority: 'high',
    type: 'feature',
    labels: [],
    dependencies: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    content: {
      description: 'This is a test task',
      acceptance_criteria: ['Criterion 1', 'Criterion 2'],
      implementation_details: 'Implementation details here',
      notes: 'Some notes',
    },
  };

  const markdown = taskToMarkdown(task);
  assertEquals(markdown.includes('# Test Task'), true);
  assertEquals(markdown.includes('This is a test task'), true);
  assertEquals(markdown.includes('## Implementation Details'), true);
  assertEquals(markdown.includes('Implementation details here'), true);
  assertEquals(markdown.includes('## Acceptance Criteria'), true);
  assertEquals(markdown.includes('- [ ] Criterion 1'), true);
  assertEquals(markdown.includes('- [ ] Criterion 2'), true);
  assertEquals(markdown.includes('**Priority**: high'), true);
  assertEquals(markdown.includes('**Type**: feature'), true);
  assertEquals(markdown.includes('**Status**: in-progress'), true);
  assertEquals(markdown.includes('## Notes'), true);
  assertEquals(markdown.includes('Some notes'), true);
});

Deno.test('taskToMarkdown - should handle task without optional sections', () => {
  const task: Task = {
    id: 'minimal-001',
    title: 'Minimal Task',
    status: 'backlog',
    priority: 'low',
    type: 'chore',
    labels: [],
    dependencies: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    content: {
      description: '',
      acceptance_criteria: [],
      implementation_details: '',
      notes: '',
    },
  };

  const markdown = taskToMarkdown(task);
  assertEquals(markdown.includes('# Minimal Task'), true);
  assertEquals(markdown.includes('**Priority**: low'), true);
  assertEquals(markdown.includes('**Type**: chore'), true);
  assertEquals(markdown.includes('**Status**: backlog'), true);
  assertEquals(markdown.includes('## Implementation Details'), false);
  assertEquals(markdown.includes('## Acceptance Criteria'), false);
  assertEquals(markdown.includes('## Notes'), false);
}); 