import type { Task, TaskContent } from '../types/index.ts';

/**
 * Converts a markdown string to a Task object
 */
export function markdownToTask(markdown: string, id: string): Task {
  if (!markdown.trim()) {
    throw new Error(`Task file is empty: ${id}`);
  }

  const lines = markdown.split('\n');
  const title = lines[0].replace(/^#\s+/, '').trim();
  
  if (!title) {
    throw new Error(`Task title is missing: ${id}`);
  }
  
  const content: TaskContent = {
    description: '',
    acceptance_criteria: [],
    implementation_details: '',
    notes: '',
    attachments: [],
    due_date: '',
    assignee: ''
  };
  
  let description = '';
  let status: Task['status'] = 'backlog';
  let priority: Task['priority'] = 'low';
  let type: Task['type'] = 'feature';
  const labels: string[] = [];
  const dependencies: string[] = [];
  let parent = '';

  let currentSection = '';
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('## ')) {
      currentSection = line.slice(3).toLowerCase();
      continue;
    }

    if (line.startsWith('**') && line.includes(':')) {
      const [key, value] = line.slice(2).split('**: ').map(s => s.trim());
      switch (key.toLowerCase()) {
        case 'status':
          if (isValidStatus(value)) {
            status = value;
          }
          break;
        case 'priority':
          if (isValidPriority(value)) {
            priority = value;
          }
          break;
        case 'type':
          if (isValidType(value)) {
            type = value;
          }
          break;
        case 'labels':
          labels.push(...value.split(',').map(l => l.trim()).filter(Boolean));
          break;
        case 'dependencies':
          dependencies.push(...value.split(',').map(d => d.trim()).filter(Boolean));
          break;
        case 'parent':
          parent = value;
          break;
        case 'due date':
          content.due_date = value;
          break;
        case 'assignee':
          content.assignee = value;
          break;
      }
      continue;
    }

    switch (currentSection) {
      case 'description':
        description += (description ? '\n' : '') + line;
        break;
      case 'acceptance criteria':
        if (line.startsWith('- ')) {
          content.acceptance_criteria.push(line.slice(2));
        }
        break;
      case 'implementation details':
        content.implementation_details = (content.implementation_details || '') + (content.implementation_details ? '\n' : '') + line;
        break;
      case 'notes':
        content.notes = (content.notes || '') + (content.notes ? '\n' : '') + line;
        break;
      case 'attachments':
        if (line.startsWith('- ')) {
          content.attachments.push(line.slice(2).trim());
        }
        break;
      default:
        if (!currentSection && line) {
          description += (description ? '\n' : '') + line;
        }
    }
  }

  content.description = description;

  return {
    id,
    title,
    description,
    status,
    priority,
    type,
    labels,
    dependencies,
    parent: parent || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: 0,
    content,
    status_history: []
  };
}

/**
 * Converts a Task object to a markdown string
 */
export function taskToMarkdown(task: Task): string {
  const lines = [
    `# ${task.title}`,
    '',
    '## Description',
    task.content.description || '',
    '',
    `**Status**: ${task.status}`,
    `**Priority**: ${task.priority}`,
    `**Type**: ${task.type}`,
    `**Labels**: ${task.labels.join(', ')}`,
    `**Dependencies**: ${task.dependencies.join(', ')}`,
    task.parent ? `**Parent**: ${task.parent}` : '',
    task.content.due_date ? `**Due Date**: ${task.content.due_date}` : '',
    task.content.assignee ? `**Assignee**: ${task.content.assignee}` : '',
    '',
    '## Implementation Details',
    task.content.implementation_details || '',
    '',
    '## Acceptance Criteria',
    ...task.content.acceptance_criteria.map(c => `- ${c}`),
    '',
    '## Notes',
    task.content.notes || '',
    ''
  ].filter(Boolean);

  return lines.join('\n');
}

function isValidStatus(value: string): value is Task['status'] {
  return ['backlog', 'in-progress', 'review', 'done'].includes(value);
}

function isValidPriority(value: string): value is Task['priority'] {
  return ['low', 'normal', 'high'].includes(value);
}

function isValidType(value: string): value is Task['type'] {
  return ['feature', 'bug', 'docs', 'chore'].includes(value);
} 