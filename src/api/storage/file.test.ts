import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { parseTaskFile, formatTaskFile, writeTask } from './file.ts';

Deno.test('Task file write and read', async () => {
  // Test data
  const task = {
    id: 'test-task',
    title: 'Test Task',
    description: 'Test Description',
    status: 'in-progress' as const,
    priority: 'high' as const,
    type: 'feature' as const,
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
  const fileContent = await Deno.readTextFile(filePath);
  console.log('Written file content:', fileContent);

  // Parse the file back into a task
  const parsedTask = parseTaskFile(fileContent);
  console.log('Parsed task:', parsedTask);

  // Verify the content matches
  assertEquals(parsedTask.content.due_date, task.content.due_date);
  assertEquals(parsedTask.content.assignee, task.content.assignee);
  assertEquals(parsedTask.type, task.type);

  // Clean up
  await Deno.remove(filePath);
}); 