import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { format } from 'date-fns';

interface LogEntry {
  timestamp: Date;
  title: string;
  tags: string[];
  relatedTasks: string[];
  status: 'completed' | 'in-progress' | 'blocked';
  userPrompt: string;
  actions: string[];
  results: string[];
  nextSteps?: string[];
}

export class LogManager {
  constructor(private readonly logPath: string = '.vtask/logs/development-log.md') {}

  async createEntry(entry: Partial<LogEntry>): Promise<string> {
    const timestamp = new Date();
    const formattedDate = format(timestamp, 'yyyy-MM-dd HH:mm');

    const logEntry = `
### ${formattedDate} - ${entry.title}

**Tags**: ${entry.tags?.map(tag => `#${tag}`).join(' ') || ''}
**Related Tasks**: ${entry.relatedTasks?.map(task => `[[${task}]]`).join(', ') || ''}
**Status**: ${entry.status || 'in-progress'}

**User Prompt:**
${entry.userPrompt || ''}

**Actions Taken:**
${entry.actions?.map(action => `- ${action}`).join('\n') || ''}

**Results:**
${entry.results?.map(result => `- ${result}`).join('\n') || ''}

${entry.nextSteps ? `
**Next Steps**:
${entry.nextSteps.map(step => `- ${step}`).join('\n')}
` : ''}

---`;

    const currentLog = await readFile(this.logPath, 'utf-8');
    const [header, ...rest] = currentLog.split('## History');
    
    const updatedLog = `${header}## History\n${logEntry}\n${rest.join('## History')}`;
    await writeFile(this.logPath, updatedLog);

    return logEntry;
  }

  async analyze(): Promise<{
    totalEntries: number;
    tagFrequency: Record<string, number>;
    statusBreakdown: Record<string, number>;
    taskReferences: string[];
  }> {
    const content = await readFile(this.logPath, 'utf-8');
    
    const entries = content.split('### ').slice(1);
    const tags = new Set<string>();
    const tagCount: Record<string, number> = {};
    const statusCount: Record<string, number> = {};
    const tasks = new Set<string>();

    for (const entry of entries) {
      // Count tags
      const tagMatch = entry.match(/\*\*Tags\*\*: (.*)/);
      if (tagMatch) {
        const entryTags = tagMatch[1].match(/#\w+/g) || [];
        for (const tag of entryTags) {
          tags.add(tag);
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        }
      }

      // Count statuses
      const statusMatch = entry.match(/\*\*Status\*\*: (\w+)/);
      if (statusMatch) {
        const status = statusMatch[1];
        statusCount[status] = (statusCount[status] || 0) + 1;
      }

      // Collect task references
      const taskMatch = entry.match(/\[\[(.*?)\]\]/g);
      if (taskMatch) {
        for (const task of taskMatch) {
          tasks.add(task.replace(/\[\[|\]\]/g, ''));
        }
      }
    }

    return {
      totalEntries: entries.length,
      tagFrequency: tagCount,
      statusBreakdown: statusCount,
      taskReferences: Array.from(tasks)
    };
  }

  async generateReport(): Promise<string> {
    const stats = await this.analyze();
    
    return `# Development Log Analysis
Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}

## Summary
- Total Entries: ${stats.totalEntries}
- Unique Tasks Referenced: ${stats.taskReferences.length}

## Tag Frequency
${Object.entries(stats.tagFrequency)
  .sort(([, a], [, b]) => b - a)
  .map(([tag, count]) => `- ${tag}: ${count}`)
  .join('\n')}

## Status Breakdown
${Object.entries(stats.statusBreakdown)
  .map(([status, count]) => `- ${status}: ${count}`)
  .join('\n')}

## Task References
${stats.taskReferences.sort().map(task => `- ${task}`).join('\n')}
`;
  }
}

// Example usage:
/*
const logManager = new LogManager();

// Create new entry
await logManager.createEntry({
  title: 'Add Search Feature',
  tags: ['feature', 'search', 'ui'],
  relatedTasks: ['task-001', 'task-002'],
  status: 'in-progress',
  userPrompt: 'Can we add search functionality?',
  actions: ['Created search component', 'Added search logic'],
  results: ['Basic search implemented'],
  nextSteps: ['Add filters', 'Improve performance']
});

// Generate report
const report = await logManager.generateReport();
console.log(report);
*/ 