import type { Context } from "koa";
import type { RouterContext } from "@koa/router";
import Router from "@koa/router";
import type { DefaultState } from "koa";
import type { Task, AcceptanceCriterion, TaskStatus } from "../types.ts";
import {
	acceptanceCriterionSchema,
	taskSchema,
	taskUpdateSchema,
} from "../schemas/validation.ts";
import { getTask, saveTask, listTasks } from "../storage/tasks.ts";

// Define custom context types
interface TaskState extends DefaultState {}

interface TaskRequestBody {
	status?: TaskStatus;
	order?: number;
	content?: {
		description?: string;
		acceptance_criteria?: Array<AcceptanceCriterion | string>;
		implementation_details?: string;
		notes?: string;
		attachments?: string[];
		due_date?: string;
		assignee?: string;
	};
	[key: string]: unknown;
}

interface TaskContext extends Context {
	request: Context["request"] & {
		body?: TaskRequestBody;
	};
}

type ApiContext = RouterContext<TaskState, TaskContext>;

const router = new Router<TaskState, TaskContext>();

// Helper function to generate UUID
function generateUUID(): string {
	return crypto.randomUUID();
}

// Helper function to create a new acceptance criterion
function createAcceptanceCriterion(
	description: string,
	order: number,
): AcceptanceCriterion {
	const now = new Date().toISOString();
	return {
		id: generateUUID(),
		description,
		completed: false,
		completed_at: null,
		completed_by: null,
		created_at: now,
		updated_at: now,
		order,
	};
}

// Helper function to clean up nullable fields with better typing
function cleanNullableFields<T>(obj: T): T {
	if (typeof obj !== "object" || obj === null) {
		return obj;
	}

	const result = {} as { [K in keyof T]: T[K] | undefined };

	for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
		const typedKey = key as keyof T;
		if (value === null) {
			result[typedKey] = undefined;
		} else if (typeof value === "object") {
			result[typedKey] = cleanNullableFields(value) as T[typeof typedKey];
		} else {
			result[typedKey] = value as T[typeof typedKey];
		}
	}

	return result as T;
}

// Helper function to ensure task content fields
function ensureTaskContent(
	content: Partial<Task["content"]> | undefined,
	defaultContent?: Task["content"],
): Task["content"] {
	const emptyContent: Task["content"] = {
		description: "",
		acceptance_criteria: [],
		implementation_details: "",
		notes: "",
		attachments: [],
		due_date: "",
		assignee: "",
	};

	// Clean up the content first to handle null values
	const cleanedContent = content
		? cleanNullableFields({
				description: content.description ?? undefined,
				acceptance_criteria: content.acceptance_criteria ?? undefined,
				implementation_details: content.implementation_details ?? undefined,
				notes: content.notes ?? undefined,
				attachments: content.attachments ?? undefined,
				due_date: content.due_date ?? undefined,
				assignee: content.assignee ?? undefined,
			} as Partial<Task["content"]>)
		: ({
				description: undefined,
				acceptance_criteria: undefined,
				implementation_details: undefined,
				notes: undefined,
				attachments: undefined,
				due_date: undefined,
				assignee: undefined,
			} as Partial<Task["content"]>);

	const cleanDefault = defaultContent
		? cleanNullableFields(defaultContent)
		: emptyContent;

	return {
		description: cleanedContent.description ?? cleanDefault.description,
		acceptance_criteria:
			cleanedContent.acceptance_criteria ?? cleanDefault.acceptance_criteria,
		implementation_details:
			cleanedContent.implementation_details ??
			cleanDefault.implementation_details,
		notes: cleanedContent.notes ?? cleanDefault.notes,
		attachments: cleanedContent.attachments ?? cleanDefault.attachments,
		due_date: cleanedContent.due_date ?? cleanDefault.due_date,
		assignee: cleanedContent.assignee ?? cleanDefault.assignee,
	};
}

// Helper function to ensure task has required fields
function ensureTaskFields(task: Partial<Task>): Task {
	// Clean up any null values recursively
	const cleanTask = cleanNullableFields(task);

	return {
		id: cleanTask.id ?? generateUUID(),
		title: cleanTask.title ?? "",
		description: cleanTask.description ?? "",
		status: cleanTask.status ?? "backlog",
		priority: cleanTask.priority ?? "normal",
		type: cleanTask.type ?? "feature",
		order: cleanTask.order ?? 0,
		created_at: cleanTask.created_at ?? new Date().toISOString(),
		updated_at: cleanTask.updated_at ?? new Date().toISOString(),
		content: ensureTaskContent(cleanTask.content),
		parent: cleanTask.parent,
		board: cleanTask.board,
		column: cleanTask.column,
		labels: cleanTask.labels ?? [],
		dependencies: cleanTask.dependencies ?? [],
		status_history: cleanTask.status_history ?? [],
	} as Task;
}

router
	.get("/tasks", async (ctx: ApiContext) => {
		try {
			const tasks = await listTasks();
			// Return only the lightweight version of tasks
			ctx.response.body = tasks.map((task) => ({
				id: task.id,
				title: task.title,
				status: task.status,
				priority: task.priority,
				type: task.type,
				labels: task.labels,
				dependencies: task.dependencies,
				metrics: {
					acceptance_criteria: {
						total: task.content.acceptance_criteria.length,
						completed: task.content.acceptance_criteria.filter(
							(c) => c.completed,
						).length,
					},
				},
				order: task.order,
			}));
		} catch (error) {
			console.error("Error listing tasks:", error);
			ctx.response.status = 500;
			ctx.response.body = { error: "Failed to list tasks" };
		}
	})
	.get("/tasks/:id", async (ctx: ApiContext) => {
		try {
			const { id } = ctx.params;
			const task = await getTask(id);
			if (!task) {
				ctx.response.status = 404;
				return;
			}
			// Return only the lightweight version
			ctx.response.body = {
				id: task.id,
				title: task.title,
				status: task.status,
				priority: task.priority,
				type: task.type,
				labels: task.labels,
				dependencies: task.dependencies,
				metrics: {
					acceptance_criteria: {
						total: task.content.acceptance_criteria.length,
						completed: task.content.acceptance_criteria.filter(
							(c) => c.completed,
						).length,
					},
				},
				order: task.order,
			};
		} catch (error) {
			console.error("Error getting task:", error);
			ctx.response.status = 500;
			ctx.response.body = { error: "Failed to get task" };
		}
	})
	.get("/tasks/:id/details", async (ctx: ApiContext) => {
		try {
			const { id } = ctx.params;
			const task = await getTask(id);
			if (!task) {
				ctx.response.status = 404;
				return;
			}
			// Return the full task details
			ctx.response.body = task;
		} catch (error) {
			console.error("Error getting task details:", error);
			ctx.response.status = 500;
			ctx.response.body = { error: "Failed to get task details" };
		}
	})
	.post("/tasks", async (ctx: ApiContext) => {
		const body = ctx.request.body as Partial<Task>;
		console.log("Creating task with body:", JSON.stringify(body, null, 2));

		// Transform acceptance criteria to new format if they're in the old format
		const criteria = body.content?.acceptance_criteria;
		if (Array.isArray(criteria) && criteria.length > 0) {
			body.content = ensureTaskContent({
				...body.content,
				acceptance_criteria: criteria.map(
					(criterion: string | AcceptanceCriterion, index: number) => {
						if (typeof criterion === "string") {
							return createAcceptanceCriterion(
								criterion.replace(/^\[[ x]\]\s*/, ""),
								index,
							);
						}
						return criterion;
					},
				),
			});
		}

		const parsedTask = taskSchema.parse(body);
		const task = ensureTaskFields(parsedTask);
		console.log("Parsed task:", JSON.stringify(task, null, 2));
		await saveTask(task);
		ctx.response.body = task;
	})
	.put("/tasks/:id", async (ctx: ApiContext) => {
		const { id } = ctx.params;
		const body = ctx.request.body as { status: TaskStatus; order: number };

		// Load the existing task
		const task = await getTask(id);
		if (!task) {
			ctx.response.status = 404;
			ctx.response.body = { error: "Task not found" };
			return;
		}

		// For move operations, only update status and order
		if (Object.keys(body).length === 2 && "status" in body && "order" in body) {
			const moveUpdate = {
				status: body.status,
				order: body.order,
				updated_at: new Date().toISOString(),
			};

			const updatedTask = ensureTaskFields({
				...task,
				...moveUpdate,
			});

			await saveTask(updatedTask);

			// Return response with metrics included
			const responseData = {
				id: updatedTask.id,
				status: updatedTask.status,
				order: updatedTask.order,
				updated_at: updatedTask.updated_at,
				metrics: {
					acceptance_criteria: {
						total: updatedTask.content.acceptance_criteria.length,
						completed: updatedTask.content.acceptance_criteria.filter(
							(c) => c.completed,
						).length,
					},
				},
			};

			ctx.response.body = responseData;
			return;
		}

		// For full updates, use the schema validation
		const update = taskUpdateSchema.parse(body);

		// Clean up the update data and ensure all fields are properly typed
		const cleanUpdate: Partial<Task> = {
			...update,
			updated_at: new Date().toISOString(),
			// Convert null values to undefined
			parent: update.parent ?? undefined,
			board: update.board ?? undefined,
			column: update.column ?? undefined,
			// Handle content separately to ensure proper typing
			content: update.content
				? {
						description: update.content.description ?? task.content.description,
						acceptance_criteria:
							update.content.acceptance_criteria ??
							task.content.acceptance_criteria,
						implementation_details:
							update.content.implementation_details ??
							task.content.implementation_details,
						notes: update.content.notes ?? task.content.notes,
						attachments: update.content.attachments ?? task.content.attachments,
						due_date: update.content.due_date ?? task.content.due_date,
						assignee: update.content.assignee ?? task.content.assignee,
					}
				: task.content,
		};

		const updatedTask = ensureTaskFields({
			...task,
			...cleanUpdate,
		});

		await saveTask(updatedTask);

		ctx.response.body = {
			id: updatedTask.id,
			status: updatedTask.status,
			order: updatedTask.order,
			updated_at: updatedTask.updated_at,
			metrics: {
				acceptance_criteria: {
					total: updatedTask.content.acceptance_criteria.length,
					completed: updatedTask.content.acceptance_criteria.filter(
						(c) => c.completed,
					).length,
				},
			},
		};
	})
	.patch(
		"/tasks/:id/acceptance-criteria/:criterionId",
		async (ctx: ApiContext) => {
			const { id, criterionId } = ctx.params;
			const body = ctx.request.body as Partial<AcceptanceCriterion>;

			const task = await getTask(id);
			if (!task) {
				ctx.response.status = 404;
				return;
			}

			const criterionIndex = task.content.acceptance_criteria.findIndex(
				(c: AcceptanceCriterion) => c.id === criterionId,
			);
			if (criterionIndex === -1) {
				ctx.response.status = 404;
				return;
			}

			const criterion = task.content.acceptance_criteria[criterionIndex];
			const updatedCriterion = {
				...criterion,
				...body,
				updated_at: new Date().toISOString(),
			};

			// Validate the updated criterion
			const validatedCriterion =
				acceptanceCriterionSchema.parse(updatedCriterion);

			task.content.acceptance_criteria[criterionIndex] = validatedCriterion;
			await saveTask(task);

			ctx.response.body = validatedCriterion;
		},
	)
	.delete("/tasks/:id", async (ctx: ApiContext) => {
		// ... existing code ...
	});

export default router;
