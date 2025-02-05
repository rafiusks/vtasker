import type { Task, Board, TaskStatus, TaskTypeEntity } from "../types";
import { convertAPITaskToTask, type APITask } from "../utils/apiTypes";
import type {
	TaskStatusId,
	TaskType,
	TaskPriority,
} from "../types/typeReference";

const API_BASE = "http://localhost:8000/api";

export interface TaskMoveRequest {
	status_id: TaskStatusId;
	order: number;
	comment?: string;
	previous_status_id?: TaskStatusId;
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
		// First, get the list of statuses to get a valid status ID
		const statuses = await this.listStatuses();
		if (!statuses || statuses.length === 0) {
			throw new Error("No task statuses available");
		}

		// Get the first status (usually "To Do")
		const defaultStatus = statuses[0];
		if (!defaultStatus || !defaultStatus.id) {
			throw new Error("Invalid status configuration");
		}

		return this.request<Task>("/tasks", {
			method: "POST",
			body: JSON.stringify({
				...task,
				status_id: task.status_id || defaultStatus.id,
				priority_id: Number(task.priority_id || 1),
				type_id: Number(task.type_id || 1),
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

	async listTaskTypes(): Promise<TaskTypeEntity[]> {
		// Since the API endpoint is not available, we'll use default values
		const defaultTypes: TaskTypeEntity[] = [
			{
				id: 1,
				code: "feature",
				name: "Feature",
				description: "New feature or enhancement",
				display_order: 1,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
			{
				id: 2,
				code: "bug",
				name: "Bug",
				description: "Bug fix",
				display_order: 2,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
			{
				id: 3,
				code: "docs",
				name: "Documentation",
				description: "Documentation update",
				display_order: 3,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
			{
				id: 4,
				code: "chore",
				name: "Chore",
				description: "Maintenance task",
				display_order: 4,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
		];

		return defaultTypes;
	}

	async listPriorities(): Promise<TaskPriority[]> {
		return this.request<TaskPriority[]>("/task-priorities");
	}

	async listTypes(): Promise<TaskType[]> {
		return this.request<TaskType[]>("/task-types");
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
