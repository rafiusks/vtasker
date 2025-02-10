import type { Task, Board } from "../types";
import { convertAPITaskToTask, type APITask } from "../utils/apiTypes";
import type {
	TaskStatusId,
	TaskStatusEntity,
	TaskTypeEntity,
	TaskPriorityEntity,
} from "../types/typeReference";

const API_BASE = "http://localhost:8000/api";

export interface TaskMoveRequest {
	status_id: TaskStatusId;
	order: number;
	comment?: string;
	previous_status_id?: TaskStatusId;
	type: string;
}

export interface TaskUpdateRequest {
	title?: string;
	description?: string;
	status_id?: number;
	priority_id?: number;
	type_id: number;
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
		const url = `${API_BASE}${endpoint}`;
		console.log("Making request to:", url, {
			method: options.method,
			headers: options.headers,
			body: options.body,
		});

		try {
			const response = await fetch(url, {
				...options,
				headers: {
					"Content-Type": "application/json",
					...options.headers,
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				console.error("Response error:", errorData);
				throw new Error(
					errorData?.error ||
						errorData?.message ||
						`HTTP error! status: ${response.status}`,
				);
			}

			if (response.status === 204) {
				return [] as T;
			}

			const data = await response.json();
			if (data === null) {
				console.warn("Received null response from API");
				return [] as T;
			}
			return data;
		} catch (error) {
			console.error("Request failed:", error);
			throw new Error(
				error instanceof Error ? error.message : "Request failed",
			);
		}
	}

	async listTasks(
		params: URLSearchParams = new URLSearchParams(),
	): Promise<Task[]> {
		const response = await this.request<APITask[]>(
			`/tasks?${params.toString()}`,
		);

		if (Array.isArray(response) && response.length === 0) {
			return [];
		}

		if (!response || typeof response !== "object" || !Array.isArray(response)) {
			console.warn(
				"Unexpected response format from /tasks endpoint:",
				response,
			);
			return [];
		}

		return response.map(convertAPITaskToTask);
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

	async moveTask(taskId: string, request: TaskMoveRequest): Promise<Task> {
		return this.request<Task>(`/tasks/${taskId}/move`, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	}

	async deleteTask(id: string): Promise<void> {
		return this.request<void>(`/tasks/${id}`, {
			method: "DELETE",
		});
	}

	async listStatuses(): Promise<TaskStatusEntity[]> {
		return this.request<TaskStatusEntity[]>("/task-statuses");
	}

	async listTaskTypes(): Promise<TaskTypeEntity[]> {
		return this.request<TaskTypeEntity[]>("/task-types");
	}

	async listPriorities(): Promise<TaskPriorityEntity[]> {
		return this.request<TaskPriorityEntity[]>("/task-priorities");
	}
}

class BoardAPI {
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

	async listBoards(
		params: URLSearchParams = new URLSearchParams(),
	): Promise<Board[]> {
		return this.request<Board[]>(`/boards?${params.toString()}`);
	}

	async getBoard(id: string): Promise<Board> {
		return this.request<Board>(`/boards/${id}`);
	}

	async createBoard(board: Partial<Board>): Promise<Board> {
		return this.request<Board>("/boards", {
			method: "POST",
			body: JSON.stringify(board),
		});
	}

	async updateBoard(id: string, updates: Partial<Board>): Promise<Board> {
		return this.request<Board>(`/boards/${id}`, {
			method: "PUT",
			body: JSON.stringify(updates),
		});
	}

	async deleteBoard(id: string): Promise<void> {
		return this.request<void>(`/boards/${id}`, {
			method: "DELETE",
		});
	}
}

export const taskAPI = new TaskAPI();
export const boardAPI = new BoardAPI();
