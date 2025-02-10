import type { Context } from "koa";
import type { RouterContext } from "@koa/router";
import Router from "@koa/router";
import type { DefaultState } from "koa";
import type {
	Task,
	AcceptanceCriterion,
	TaskContent,
	TaskRelationships,
	TaskMetadata,
} from "../types";
import { v4 as uuidv4 } from "uuid";

// Define custom context types
interface TaskState extends DefaultState {}

interface TaskRequestBody {
	title?: string;
	description?: string;
	status_id?: number;
	priority_id?: number;
	type_id?: number;
	order?: number;
	content?: TaskContent;
	relationships?: TaskRelationships;
	metadata?: TaskMetadata;
}

interface TaskContext extends Context {
	request: Context["request"] & {
		body?: TaskRequestBody;
	};
}

type ApiContext = RouterContext<TaskState, TaskContext>;

const router = new Router<TaskState, TaskContext>();

// Helper function to ensure task has required fields
function ensureTaskFields(task: Partial<Task>): Task {
	return {
		id: task.id ?? uuidv4(),
		title: task.title ?? "",
		description: task.description ?? "",
		status_id: task.status_id ?? 1,
		priority_id: task.priority_id ?? 1,
		type_id: task.type_id ?? 1,
		order: task.order ?? 0,
		content: task.content ?? {
			description: task.description ?? "",
			acceptance_criteria: [],
			implementation_details: undefined,
			notes: undefined,
			attachments: [],
			due_date: undefined,
			assignee: undefined,
		},
		relationships: task.relationships ?? {
			parent: undefined,
			dependencies: [],
			labels: [],
		},
		metadata: task.metadata ?? {
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			board: undefined,
			column: undefined,
		},
		progress: task.progress ?? {
			acceptance_criteria: {
				total: 0,
				completed: 0,
			},
			percentage: 0,
		},
		created_at: task.created_at ?? new Date().toISOString(),
		updated_at: task.updated_at ?? new Date().toISOString(),
		status_history: task.status_history ?? [],
	};
}

// Mock functions for now - replace with actual implementations
async function listTasks(): Promise<Task[]> {
	return [];
}

async function getTask(_id: string): Promise<Task | null> {
	return null;
}

async function saveTask(_task: Task): Promise<void> {
	// Implementation
}

router
	.get("/tasks", async (ctx: ApiContext) => {
		try {
			const tasks = await listTasks();
			// Return only the lightweight version of tasks
			ctx.response.body = tasks.map((task: Task) => ({
				id: task.id,
				title: task.title,
				status_id: task.status_id,
				priority_id: task.priority_id,
				type_id: task.type_id,
				relationships: task.relationships,
				metrics: {
					acceptance_criteria: {
						total: task.content.acceptance_criteria.length,
						completed: task.content.acceptance_criteria.filter(
							(c: AcceptanceCriterion) => c.completed,
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
				status_id: task.status_id,
				priority_id: task.priority_id,
				type_id: task.type_id,
				relationships: task.relationships,
				metrics: {
					acceptance_criteria: {
						total: task.content.acceptance_criteria.length,
						completed: task.content.acceptance_criteria.filter(
							(c: AcceptanceCriterion) => c.completed,
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
		try {
			const taskData: TaskRequestBody = ctx.request.body ?? {};
			const task = ensureTaskFields({
				...taskData,
				content: taskData.content
					? {
							description: taskData.content.description ?? "",
							acceptance_criteria: taskData.content.acceptance_criteria ?? [],
							implementation_details: taskData.content.implementation_details,
							notes: taskData.content.notes,
							attachments: taskData.content.attachments ?? [],
							due_date: taskData.content.due_date,
							assignee: taskData.content.assignee,
						}
					: undefined,
			});
			await saveTask(task);
			ctx.response.body = task;
		} catch (error) {
			console.error("Error creating task:", error);
			ctx.response.status = 500;
			ctx.response.body = { error: "Failed to create task" };
		}
	})
	.put("/tasks/:id", async (ctx: ApiContext) => {
		try {
			const { id } = ctx.params;
			const updateData: TaskRequestBody = ctx.request.body ?? {};

			const task = await getTask(id);
			if (!task) {
				ctx.response.status = 404;
				ctx.response.body = { error: "Task not found" };
				return;
			}

			const updatedTask = ensureTaskFields({
				...task,
				...updateData,
				content: updateData.content
					? {
							...task.content,
							...updateData.content,
						}
					: task.content,
				relationships: updateData.relationships
					? {
							...task.relationships,
							...updateData.relationships,
						}
					: task.relationships,
				metadata: updateData.metadata
					? {
							...task.metadata,
							...updateData.metadata,
						}
					: task.metadata,
				updated_at: new Date().toISOString(),
			});

			await saveTask(updatedTask);
			ctx.response.body = updatedTask;
		} catch (error) {
			console.error("Error updating task:", error);
			ctx.response.status = 500;
			ctx.response.body = { error: "Failed to update task" };
		}
	})
	.delete("/tasks/:id", async (ctx: ApiContext) => {
		try {
			const { id } = ctx.params;
			const task = await getTask(id);

			if (!task) {
				ctx.response.status = 404;
				ctx.response.body = { error: "Task not found" };
				return;
			}

			// Delete the task
			// await deleteTask(id);
			ctx.response.status = 204;
		} catch (error) {
			console.error("Error deleting task:", error);
			ctx.response.status = 500;
			ctx.response.body = { error: "Failed to delete task" };
		}
	});

export default router;
