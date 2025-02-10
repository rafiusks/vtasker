import type { Task } from "../types";
import type { ApiTask } from "./types";
import { convertAPITaskToTask } from "./types";
import type {
	TaskStatusId,
	TaskStatusEntity,
	TaskTypeEntity,
	TaskPriorityEntity,
} from "../types/typeReference";
import type { Board } from "../types";
import type {
	LoginResponse,
	User,
	UserCreate,
	UserLogin,
	RefreshTokenResponse,
} from "../types/auth";

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

export class BaseAPI {
	private headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	protected async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const response = await fetch(`${API_BASE}${endpoint}`, {
			...options,
			headers: {
				...this.headers,
				...options.headers,
			},
		});

		if (!response.ok) {
			const data = await response.json().catch(() => null);
			throw new Error(
				data?.message ||
					data?.error ||
					`HTTP error! status: ${response.status}`,
			);
		}

		if (response.status === 204) {
			return undefined as T;
		}

		const data = await response.json();
		return data;
	}

	setAuthHeader(value: string): void {
		this.headers.Authorization = value;
	}

	removeAuthHeader(): void {
		this.headers.Authorization = "";
	}
}

export class TaskAPI extends BaseAPI {
	listTasks = async (): Promise<Task[]> => {
		const response = await this.request<ApiTask[]>("/tasks");
		return response?.map(convertAPITaskToTask) || [];
	};

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
			body: JSON.stringify({
				...updates,
				content: {
					...updates.content,
					description: updates.content?.description || "",
					acceptance_criteria: updates.content?.acceptance_criteria || [],
					implementation_details: updates.content?.implementation_details,
					notes: updates.content?.notes,
					attachments: updates.content?.attachments || [],
					due_date: updates.content?.due_date,
					assignee: updates.content?.assignee,
				},
			}),
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

class BoardAPI extends BaseAPI {
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

export class AuthAPI extends BaseAPI {
	async register(data: UserCreate): Promise<User> {
		return this.request<User>("/auth/register", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async login(data: UserLogin): Promise<LoginResponse> {
		return this.request<LoginResponse>("/auth/login", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
		return this.request<RefreshTokenResponse>("/auth/refresh", {
			method: "POST",
			body: JSON.stringify({ refreshToken }),
		});
	}
}

export const taskAPI = new TaskAPI();
export const boardAPI = new BoardAPI();
export const authAPI = new AuthAPI();
