import type { Task, Board, TaskStatus } from "../types";

const API_BASE = "http://localhost:8000/api";

export interface TaskMoveRequest {
	status_id: number;
	order: number;
	comment?: string;
	previous_status_id?: number;
	type?: string;
}

export interface TaskUpdateRequest {
	title?: string;
	description?: string;
	status_id?: number;
	priority_id?: number;
	type?: string;
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
		return this.request<Task>(`/tasks/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				status_id: move.status_id,
				order: move.order,
				comment: move.comment,
				previous_status_id: move.previous_status_id,
				type: move.type,
				_moveOperation: true,
			}),
		});
	}

	async deleteTask(id: string): Promise<void> {
		return this.request<void>(`/tasks/${id}`, {
			method: "DELETE",
		});
	}

	async listStatuses(): Promise<TaskStatus[]> {
		return this.request<TaskStatus[]>("/task-statuses");
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
