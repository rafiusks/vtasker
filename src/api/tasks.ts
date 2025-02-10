import type { Task } from "../types";

// Use relative path to work with Vite proxy
const API_BASE = "/api";

export interface TaskMoveRequest {
	status: string;
	order: number;
}

export interface TaskUpdateRequest {
	title?: string;
	description?: string;
	status_id?: number;
	priority_id?: number;
	type_id?: number;
	labels?: string[];
	dependencies?: string[];
	content?: {
		description?: string;
		acceptance_criteria?: Array<{
			id: string;
			description: string;
			completed: boolean;
			order: number;
		}>;
		implementation_details?: string;
		notes?: string;
		attachments?: string[];
		due_date?: string;
		assignee?: string;
	};
	parent?: string;
	board?: string;
	column?: string;
}

class TaskAPI {
	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const response = await fetch(`${API_BASE}${endpoint}`, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
		});

		const data = await response.json().catch(() => null);

		if (!response.ok) {
			throw new Error(
				data?.message ||
					data?.error ||
					`HTTP error! status: ${response.status}`,
			);
		}

		if (response.status === 204) {
			return {} as T;
		}

		return data;
	}

	async listTasks(
		params: URLSearchParams = new URLSearchParams(),
	): Promise<Task[]> {
		return this.request<Task[]>(`/tasks?${params.toString()}`);
	}

	async getTask(id: string): Promise<Task> {
		return this.request<Task>(`/tasks/${id}`);
	}

	async createTask(task: Partial<Task>): Promise<Task> {
		return this.request<Task>("/tasks", {
			method: "POST",
			body: JSON.stringify({
				...task,
				status_id: task.status_id ? String(task.status_id) : "1",
				priority_id: task.priority_id ? String(task.priority_id) : "1",
				type_id: task.type_id ? String(task.type_id) : "1",
				content: {
					...task.content,
					description: task.content?.description || task.description,
					acceptance_criteria: task.content?.acceptance_criteria || [],
					implementation_details: task.content?.implementation_details || null,
					notes: task.content?.notes || null,
					attachments: task.content?.attachments || [],
					due_date: task.content?.due_date || null,
					assignee: task.content?.assignee || null,
				},
				relationships: {
					parent: task.relationships?.parent || null,
					dependencies: task.relationships?.dependencies || [],
					labels: task.relationships?.labels || [],
				},
				metadata: {
					created_at: task.metadata?.created_at || new Date().toISOString(),
					updated_at: task.metadata?.updated_at || new Date().toISOString(),
					board: task.metadata?.board || null,
					column: task.metadata?.column || null,
				},
				progress: {
					acceptance_criteria: {
						total: task.progress?.acceptance_criteria?.total || 0,
						completed: task.progress?.acceptance_criteria?.completed || 0,
					},
					percentage: task.progress?.percentage || 0,
				},
			}),
		});
	}

	async updateTask(id: string, updates: TaskUpdateRequest): Promise<Task> {
		return this.request<Task>(`/tasks/${id}`, {
			method: "PUT",
			body: JSON.stringify({
				...updates,
				status_id: updates.status_id ? String(updates.status_id) : undefined,
				priority_id: updates.priority_id
					? String(updates.priority_id)
					: undefined,
				type_id: updates.type_id ? String(updates.type_id) : undefined,
			}),
		});
	}

	async moveTask(id: string, move: TaskMoveRequest): Promise<Task> {
		return this.request<Task>(`/tasks/${id}/move`, {
			method: "PUT",
			body: JSON.stringify(move),
		});
	}

	async deleteTask(id: string): Promise<void> {
		return this.request<void>(`/tasks/${id}`, {
			method: "DELETE",
		});
	}
}

export const taskAPI = new TaskAPI();
