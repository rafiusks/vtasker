import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Task } from '../../types';

describe('Task API', () => {
  const testTask: Task = {
    id: 'task-003-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'in-progress',
    priority: 'high',
    type: 'feature',
    labels: ['test'],
    dependencies: ['task-001'],
    content: {
      description: 'Test Description',
      acceptance_criteria: [],
      implementation_details: '',
      notes: '',
      attachments: [],
      due_date: '2025-02-01',
      assignee: 'Test User'
    },
    created_at: '2025-02-01T00:00:00.000Z',
    updated_at: '2025-02-01T00:00:00.000Z',
    order: 0,
    status_history: []
  };

  it('should update task metadata correctly', async () => {
    // Update task
    const response = await fetch(`http://localhost:8000/api/tasks/${testTask.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: testTask.title,
        description: testTask.description,
        status: testTask.status,
        priority: testTask.priority,
        type: testTask.type,
        labels: testTask.labels,
        dependencies: testTask.dependencies,
        content: {
          description: testTask.description,
          acceptance_criteria: [],
          implementation_details: '',
          notes: '',
          attachments: [],
          due_date: testTask.content.due_date,
          assignee: testTask.content.assignee
        }
      })
    });

    expect(response.ok).toBe(true);
    const updatedTask = await response.json();
    console.log('API Response:', updatedTask);

    // Verify the update was successful
    expect(updatedTask.content.due_date).toBe(testTask.content.due_date);
    expect(updatedTask.content.assignee).toBe(testTask.content.assignee);
    expect(updatedTask.type).toBe(testTask.type);

    // Verify persistence by fetching the task again
    const getResponse = await fetch(`http://localhost:8000/api/tasks/${testTask.id}`);
    expect(getResponse.ok).toBe(true);
    const fetchedTask = await getResponse.json();
    console.log('Fetched task:', fetchedTask);

    expect(fetchedTask.content.due_date).toBe(testTask.content.due_date);
    expect(fetchedTask.content.assignee).toBe(testTask.content.assignee);
    expect(fetchedTask.type).toBe(testTask.type);
  });
}); 