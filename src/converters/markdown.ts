import type { Task } from '../types/index.ts';

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
  
  let description = '';
  let status: Task['status'] = 'backlog';
  let priority: Task['priority'] = 'low';
  let labels: string[] = [];
  let dependencies: string[] = [];
  let notes = '';
  let attachments: string[] = [];

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
        case 'labels':
          labels = value.split(',').map(l => l.trim()).filter(Boolean);
          break;
        case 'dependencies':
          dependencies = value.split(',').map(d => d.trim()).filter(Boolean);
          break;
      }
      continue;
    }

    switch (currentSection) {
      case 'description':
        description += (description ? '\n' : '') + line;
        break;
      case 'notes':
        notes += (notes ? '\n' : '') + line;
        break;
      case 'attachments':
        if (line.startsWith('- ')) {
          attachments.push(line.slice(2).trim());
        }
        break;
      default:
        if (!currentSection && line) {
          description += (description ? '\n' : '') + line;
        }
    }
  }

  return {
    id,
    title,
    description,
    status,
    priority,
    labels,
    dependencies,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    content: {
      notes,
      attachments,
    },
  };
}

function isValidStatus(status: string): status is Task['status'] {
  return ['backlog', 'in_progress', 'review', 'done'].includes(status);
}

function isValidPriority(priority: string): priority is Task['priority'] {
  return ['low', 'medium', 'high'].includes(priority);
}

/**
 * Converts a Task object to a markdown string
 */
export function taskToMarkdown(task: Task): string {
  let markdown = `# ${task.title}\n\n`;

  if (task.description) {
    markdown += `## Description\n${task.description}\n\n`;
  }

  markdown += `**Status**: ${task.status}\n`;
  markdown += `**Priority**: ${task.priority}\n`;

  if (task.labels?.length > 0) {
    markdown += `**Labels**: ${task.labels.join(', ')}\n`;
  }

  if (task.dependencies?.length > 0) {
    markdown += `**Dependencies**: ${task.dependencies.join(', ')}\n`;
  }

  if (task.content?.notes) {
    markdown += `\n## Notes\n${task.content.notes}\n`;
  }

  if (task.content?.attachments?.length > 0) {
    markdown += '\n## Attachments\n';
    for (const attachment of task.content.attachments) {
      markdown += `- ${attachment}\n`;
    }
  }

  return markdown;
} 