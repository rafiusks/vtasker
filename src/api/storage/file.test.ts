import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { parseTaskFile, writeTask } from './file';

describe('Task file operations', () => {
  it('should write and read task file correctly', async () => {
    // Test data
    const task = {
      id: 'test-task',
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

    // Write the task
    await writeTask(task);

    // Read the file content
    const filePath = `.vtask/tasks/${task.id}.md`;
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    console.log('Written file content:', fileContent);

    // Parse the file back into a task
    const parsedTask = parseTaskFile(fileContent);
    console.log('Parsed task:', parsedTask);

    // Verify the content matches
    expect(parsedTask.content.due_date).toBe(task.content.due_date);
    expect(parsedTask.content.assignee).toBe(task.content.assignee);
    expect(parsedTask.type).toBe(task.type);

    // Clean up
    await fs.promises.unlink(filePath);
  });
});