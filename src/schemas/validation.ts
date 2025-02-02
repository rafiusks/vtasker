import { z } from "zod";

// Task Schemas
export const taskStatusSchema = z.enum([
	"backlog",
	"in-progress",
	"review",
	"done",
] as const);
export const taskPrioritySchema = z.enum(["low", "normal", "high"] as const);
export const taskTypeSchema = z.enum([
	"feature",
	"bug",
	"docs",
	"chore",
] as const);

const taskIdSchema = z
	.string()
	.regex(
		/^(task-\d{3}(-\d{1,2})?|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/,
	);

export const taskMetadataSchema = z.object({
	id: taskIdSchema,
	title: z.string().min(1).max(200),
	description: z.string(),
	status: taskStatusSchema,
	priority: taskPrioritySchema,
	type: taskTypeSchema,
	created_at: z.string().datetime().optional(),
	updated_at: z.string().datetime().optional(),
	assignee: z.string().optional(),
	labels: z.array(z.string()),
	dependencies: z.array(taskIdSchema),
	parent: taskIdSchema.optional(),
	board: z.string().optional(),
	column: z.string().optional(),
	status_history: z
		.array(
			z.object({
				from: taskStatusSchema,
				to: taskStatusSchema,
				timestamp: z.string().datetime(),
				comment: z.string().optional(),
			}),
		)
		.optional(),
});

export const acceptanceCriterionSchema = z.object({
	id: z.string().uuid(),
	description: z.string().min(1, "Description is required"),
	completed: z.boolean(),
	completed_at: z.string().datetime().nullable(),
	completed_by: z.string().nullable(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
	order: z.number().int(),
	category: z.string().optional(),
	notes: z.string().optional(),
});

export const taskContentSchema = z.object({
	description: z.string(),
	acceptance_criteria: z.array(acceptanceCriterionSchema),
	implementation_details: z.string().optional(),
	notes: z.string().optional(),
});

export const taskSchema = taskMetadataSchema.extend({
	content: taskContentSchema,
});

// Schema for task updates
export const taskUpdateSchema = z.object({
	title: z.string().min(1).max(200).optional(),
	description: z.string().optional(),
	status: taskStatusSchema.optional(),
	priority: taskPrioritySchema.optional(),
	type: taskTypeSchema.optional(),
	assignee: z.string().optional().nullable(),
	labels: z.array(z.string()).optional(),
	dependencies: z.array(z.string().regex(/^task-\d{3}(-\d{1,2})?$/)).optional(),
	parent: taskIdSchema.optional().nullable(),
	board: z.string().optional().nullable(),
	column: z.string().optional().nullable(),
	order: z.number().int().optional(),
	content: z
		.object({
			description: z.string().optional(),
			acceptance_criteria: z.array(acceptanceCriterionSchema).optional(),
			implementation_details: z.string().optional().nullable(),
			notes: z.string().optional().nullable(),
			attachments: z.array(z.string()).optional(),
			due_date: z.string().optional().nullable(),
			assignee: z.string().optional().nullable(),
		})
		.optional(),
	status_history: z
		.array(
			z.object({
				from: taskStatusSchema,
				to: taskStatusSchema,
				timestamp: z.string().datetime(),
				comment: z.string().optional(),
			}),
		)
		.optional(),
});

// Board Schemas
export const boardTypeSchema = z.enum(["project", "team", "personal"] as const);
export const boardStatusSchema = z.enum(["active", "archived"] as const);

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
	conditions: z.array(
		z.object({
			field: z.enum([
				"id",
				"title",
				"status",
				"priority",
				"type",
				"assignee",
				"labels",
				"dependencies",
				"parent",
				"board",
				"column",
			] as const),
			operator: z.enum(["equals", "contains", "in", "not"] as const),
			value: z.union([
				z.string(),
				z.number(),
				z.boolean(),
				z.array(z.string()),
			]),
		}),
	),
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
	context_needed: z.enum(["minimal", "moderate", "extensive"] as const),
	estimated_time: z.string().regex(/^\d+[hd]$/), // e.g., "2h", "3d"
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
