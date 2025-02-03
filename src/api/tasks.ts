import type { Task, AcceptanceCriterion } from "../types";

// Use relative path to work with Vite proxy
const API_BASE = "/api";

export interface TaskMoveRequest {
	status: string;
	order: number;
}

export interface TaskUpdateRequest {
	title?: string;
	description?: string;
	priority?: string;
	type?: string;
	labels?: string[];
	dependencies?: string[];
	content?: {
		description?: string;
		acceptance_criteria?: AcceptanceCriterion[];
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

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			throw new Error(
				errorData?.error ||
					errorData?.message ||
					`HTTP error! status: ${response.status}`,
			);
		}

		if (response.status === 204) {
			return {} as T;
		}

		return response.json();
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
			body: JSON.stringify(task),
		});
	}

	async updateTask(id: string, updates: TaskUpdateRequest): Promise<Task> {
		return this.request<Task>(`/tasks/${id}`, {
			method: "PUT",
			body: JSON.stringify(updates),
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
