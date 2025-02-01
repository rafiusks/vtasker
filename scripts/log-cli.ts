#!/usr/bin/env node

import { Command } from 'commander';
import { LogManager } from './log-utils';
import { writeFile } from 'node:fs/promises';
import process from "node:process";

const program = new Command();
const logManager = new LogManager();

program
  .name('vtask-log')
  .description('CLI to manage vTask development logs')
  .version('0.1.0');

program
  .command('new')
  .description('Create a new log entry')
  .requiredOption('-t, --title <title>', 'Entry title')
  .option('--tags <tags...>', 'Tags for the entry')
  .option('--tasks <tasks...>', 'Related task IDs')
  .option('-s, --status <status>', 'Entry status (completed|in-progress|blocked)', 'in-progress')
  .option('-p, --prompt <prompt>', 'User prompt')
  .option('-a, --actions <actions...>', 'Actions taken')
  .option('-r, --results <results...>', 'Results achieved')
  .option('-n, --next <steps...>', 'Next steps')
  .action(async (options) => {
    try {
      const entry = await logManager.createEntry({
        title: options.title,
        tags: options.tags,
        relatedTasks: options.tasks,
        status: options.status as 'completed' | 'in-progress' | 'blocked',
        userPrompt: options.prompt,
        actions: options.actions,
        results: options.results,
        nextSteps: options.next
      });
      console.log('Created log entry:\n', entry);
    } catch (error) {
      console.error('Error creating log entry:', error);
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Generate a development log report')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options) => {
    try {
      const report = await logManager.generateReport();
      if (options.output) {
        await writeFile(options.output, report);
        console.log(`Report written to ${options.output}`);
      } else {
        console.log(report);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      process.exit(1);
    }
  });

program.parse();

// Example usage:
/*
# Create new entry
vtask-log new \
  --title "Add Search Feature" \
  --tags feature search ui \
  --tasks task-001 task-002 \
  --status in-progress \
  --prompt "Can we add search functionality?" \
  --actions "Created search component" "Added search logic" \
  --results "Basic search implemented" \
  --next "Add filters" "Improve performance"

# Generate report
vtask-log report
vtask-log report --output log-report.md
*/ 