import { z } from 'zod';
import type { Task, TaskContent, Board, BoardColumn } from '../types/index.ts';
import type { TaskStatus, TaskPriority, TaskType, BoardType, BoardStatus } from '../types/index.ts';

// Task Schemas
export const taskStatusSchema = z.enum(['backlog', 'in-progress', 'review', 'done'] as const);
export const taskPrioritySchema = z.enum(['low', 'normal', 'high'] as const);
export const taskTypeSchema = z.enum(['feature', 'bug', 'docs', 'chore'] as const);

export const taskMetadataSchema = z.object({
  id: z.string().regex(/^task-\d{3}(-\d{1,2})?$/),
  title: z.string().min(1).max(200),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  type: taskTypeSchema,
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  assignee: z.string().optional(),
  labels: z.array(z.string()),
  dependencies: z.array(z.string().regex(/^task-\d{3}(-\d{1,2})?$/)),
  parent: z.string().regex(/^task-\d{3}$/).optional(),
  board: z.string().optional(),
  column: z.string().optional(),
});

export const taskContentSchema = z.object({
  description: z.string(),
  acceptance_criteria: z.array(z.string()),
  implementation_details: z.string().optional(),
  notes: z.string().optional(),
});

export const taskSchema = taskMetadataSchema.extend({
  content: taskContentSchema,
});

// Schema for task updates
export const taskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  type: taskTypeSchema.optional(),
  assignee: z.string().optional().nullable(),
  labels: z.array(z.string()).optional(),
  dependencies: z.array(z.string().regex(/^task-\d{3}(-\d{1,2})?$/)).optional(),
  parent: z.string().regex(/^task-\d{3}$/).optional().nullable(),
  board: z.string().optional().nullable(),
  column: z.string().optional().nullable(),
  content: z.object({
    description: z.string().optional(),
    acceptance_criteria: z.array(z.string()).optional(),
    implementation_details: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }).optional(),
});

// Board Schemas
export const boardTypeSchema = z.enum(['project', 'team', 'personal'] as const);
export const boardStatusSchema = z.enum(['active', 'archived'] as const);

export const boardColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: taskStatusSchema,
  limit: z.number().int().min(0),
  tasks: z.array(z.string().regex(/^task-\d{3}(-\d{1,2})?$/)),
});

export const boardFilterSchema = z.object({
  id: z.string(),
  name: z.string(),
  conditions: z.array(z.object({
    field: z.enum([
      'id', 'title', 'status', 'priority', 'type', 'assignee',
      'labels', 'dependencies', 'parent', 'board', 'column'
    ] as const),
    operator: z.enum(['equals', 'contains', 'in', 'not'] as const),
    value: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string())
    ]),
  })),
});

export const boardSettingsSchema = z.object({
  wip_limits: z.record(taskStatusSchema, z.number().int().min(0)),
  auto_archive: z.boolean(),
  archive_after_days: z.number().int().min(1),
});

export const boardSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string(),
  type: boardTypeSchema,
  status: boardStatusSchema,
  columns: z.array(boardColumnSchema),
  filters: z.array(boardFilterSchema).optional(),
  settings: boardSettingsSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// AI Integration Schemas
export const aiMetadataSchema = z.object({
  complexity: z.number().int().min(1).max(10),
  required_skills: z.array(z.string()),
  context_needed: z.enum(['minimal', 'moderate', 'extensive'] as const),
  estimated_time: z.string().regex(/^\d+[hd]$/),  // e.g., "2h", "3d"
  task_nature: z.string(),
  dependencies_graph: z.array(z.string()),
  related_components: z.array(z.string()),
});

export const aiProgressSchema = z.object({
  last_action: z.string(),
  action_type: z.string(),
  action_summary: z.string(),
  next_steps: z.array(z.string()),
  blockers: z.array(z.string()),
  insights: z.array(z.string()),
  timestamp: z.string().datetime(),
});

// Query Schemas
export const taskQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  type: taskTypeSchema.optional(),
  assignee: z.string().optional(),
  labels: z.array(z.string()).optional(),
  parent: z.string().optional(),
  board: z.string().optional(),
  column: z.string().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  updatedAfter: z.string().datetime().optional(),
  updatedBefore: z.string().datetime().optional(),
});

export const boardQuerySchema = z.object({
  type: boardTypeSchema.optional(),
  status: boardStatusSchema.optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  updatedAfter: z.string().datetime().optional(),
  updatedBefore: z.string().datetime().optional(),
}); 