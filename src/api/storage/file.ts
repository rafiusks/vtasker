import { join } from 'path';
import type { Task } from '../../types';

const tasksDir = '.vtask/tasks';

export function parseTaskFile(content: string): Task {
  const lines = content.split('\n');
  const task: Partial<Task> = {
    dependencies: [],
    labels: [],
    content: {
      description: '',
      acceptance_criteria: [],
      implementation_details: '',
      notes: '',
      attachments: [],
      due_date: '',
      assignee: ''
    },
    status_history: [],
  };

  let currentSection = '';
  let descriptionLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      task.title = line.slice(2).trim();
      continue;
    }

    if (line.startsWith('## ')) {
      currentSection = line.slice(3).trim().toLowerCase();
      continue;
    }

    // Handle metadata fields marked with **
    if (line.startsWith('**')) {
      const match = line.match(/\*\*([^:]+)\*\*:\s*(.+)/);
      if (match) {
        const [, key, value] = match;
        const trimmedValue = value.trim();
        switch (key.toLowerCase()) {
          case 'status':
            task.status = trimmedValue as Task['status'];
            break;
          case 'priority':
            task.priority = trimmedValue as Task['priority'];
            break;
          case 'type':
            task.type = trimmedValue as Task['type'];
            break;
          case 'labels': {
            const labels = trimmedValue ? trimmedValue.split(',').map(l => l.trim()) : [];
            task.labels = labels;
            break;
          }
          case 'dependencies': {
            const deps = trimmedValue ? trimmedValue.split(',').map(d => {
              const match = d.trim().match(/^(task-\d{3}(-\d{1,2})?)/);
              return match ? match[1] : d.trim();
            }) : [];
            task.dependencies = deps;
            break;
          }
          case 'parent': {
            if (trimmedValue) {
              const parentMatch = trimmedValue.match(/^(task-\d{3}(-\d{1,2})?)/);
              task.parent = parentMatch ? parentMatch[1] : trimmedValue;
            }
            break;
          }
          case 'due date':
            task.content!.due_date = trimmedValue || '';
            break;
          case 'assignee':
            task.content!.assignee = trimmedValue || '';
            break;
        }
      }
      continue;
    }

    // Handle content sections
    switch (currentSection) {
      case 'description':
        if (line.trim()) descriptionLines.push(line.trim());
        break;
      case 'acceptance criteria':
        if (line.startsWith('- ')) {
          task.content!.acceptance_criteria.push(line.slice(2).trim());
        }
        break;
      case 'implementation details':
        if (line.trim()) {
          task.content!.implementation_details = line.trim();
        }
        break;
      case 'notes':
        if (line.trim()) {
          task.content!.notes = line.trim();
        }
        break;
    }
  }

  // Set description from collected lines
  task.description = descriptionLines.join('\n').trim();
  task.content!.description = task.description;

  // Set defaults for required fields
  return {
    ...task,
    id: task.id || '',
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'backlog',
    priority: task.priority || 'normal',
    type: task.type || 'feature',
    labels: task.labels || [],
    dependencies: task.dependencies || [],
    created_at: task.created_at || new Date().toISOString(),
    updated_at: task.updated_at || new Date().toISOString(),
    order: task.order || 0,
    content: {
      description: task.description || '',
      acceptance_criteria: task.content?.acceptance_criteria || [],
      implementation_details: task.content?.implementation_details || '',
      notes: task.content?.notes || '',
      attachments: task.content?.attachments || [],
      due_date: task.content?.due_date || '',
      assignee: task.content?.assignee || ''
    },
    status_history: task.status_history || [],
  } as Task;
}

export function formatTaskFile(task: Task): string {
  const lines = [
    `# ${task.title}`,
    '',
    '## Description',
    task.description || '',
    '',
    `**Status**: ${task.status || 'backlog'}`,
    `**Priority**: ${task.priority || 'normal'}`,
    `**Type**: ${task.type || 'feature'}`,
    `**Labels**: ${task.labels?.length ? task.labels.join(', ') : ''}`,
    `**Dependencies**: ${task.dependencies?.length ? task.dependencies.join(', ') : ''}`,
    `**Parent**: ${task.parent || ''}`,
    `**Due Date**: ${task.content?.due_date || ''}`,
    `**Assignee**: ${task.content?.assignee || ''}`,
    '',
    '## Implementation Details',
    task.content?.implementation_details || '',
    '',
    '## Acceptance Criteria',
    ...(task.content?.acceptance_criteria?.map(c => `- ${c}`) || []),
    '',
    '## Notes',
    task.content?.notes || '',
    ''
  ];

  return lines.join('\n');
}

export async function writeTask(task: Task): Promise<void> {
  // Format the file content using our formatTaskFile function
  const content = formatTaskFile(task);
  console.log('Writing file content:', content);

  // Write the file
  const filePath = join(tasksDir, `${task.id}.md`);
  await Deno.writeTextFile(filePath, content);
  
  // Verify the write
  const writtenContent = await Deno.readTextFile(filePath);
  console.log('Verified file content:', writtenContent);
} 