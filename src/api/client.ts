import type { Task } from "../types";
import type { ApiTask } from "./types";
import { convertAPITaskToTask } from "./types";
import type {
	TaskStatusId,
	TaskStatusEntity,
	TaskTypeEntity,
	TaskPriorityEntity,
} from "../types/typeReference";
import type { Board } from "../types/board";
import type {
	LoginResponse,
	User,
	UserCreate,
	UserLogin,
	RefreshTokenResponse,
} from "../types/auth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Shared headers between all API instances
const sharedHeaders: Record<string, string | undefined> = {
	"Content-Type": "application/json",
};

export interface TaskMoveRequest {
	status_id: number;
	order: number;
	comment?: string;
	type?: string;
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

// Type for error responses
type APIErrorResponse = {
	status?: number;
	message?: string;
};

export class BaseAPI {
	protected async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		console.log("Making request to:", endpoint);
		console.log("Current headers:", { ...sharedHeaders });
		console.log("Auth header:", sharedHeaders.Authorization);

		// Create clean headers object without undefined values
		const headers: Record<string, string> = {};
		for (const [key, value] of Object.entries(sharedHeaders)) {
			if (value !== undefined) {
				headers[key] = value;
			}
		}

		const response = await fetch(`${API_BASE}${endpoint}`, {
			...options,
			headers: {
				...headers,
				...options.headers,
			},
		});

		if (!response.ok) {
			const data = await response.json().catch(() => null);
			console.error("Request failed:", {
				status: response.status,
				statusText: response.statusText,
				headers,
				data,
			});

			// Handle specific error cases
			if (response.status === 409) {
				throw new Error(
					data?.message || data?.error || "board name already exists",
				);
			}

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
		console.log("Setting auth header:", value);
		sharedHeaders.Authorization = value;
	}

	removeAuthHeader(): void {
		console.log("Removing auth header");
		sharedHeaders.Authorization = undefined;
	}
}

export class TaskAPI extends BaseAPI {
	listTasks = async (): Promise<Task[]> => {
		const response = await this.request<ApiTask[]>("/api/tasks");
		return response?.map(convertAPITaskToTask) || [];
	};

	async getTask(id: string): Promise<Task> {
		return this.request<Task>(`/api/tasks/${id}`);
	}

	async createTask(task: Partial<Task>): Promise<Task> {
		return this.request<Task>("/api/tasks", {
			method: "POST",
			body: JSON.stringify(task),
		});
	}

	async updateTask(id: string, updates: TaskUpdateRequest): Promise<Task> {
		return this.request<Task>(`/api/tasks/${id}`, {
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
		return this.request<Task>(`/api/tasks/${taskId}`, {
			method: "PUT",
			body: JSON.stringify({
				status_id: request.status_id,
				order: request.order,
			}),
		});
	}

	async deleteTask(id: string): Promise<void> {
		return this.request<void>(`/api/tasks/${id}`, {
			method: "DELETE",
		});
	}

	async listStatuses(): Promise<TaskStatusEntity[]> {
		return this.request<TaskStatusEntity[]>("/api/task-statuses");
	}

	async listTaskTypes(): Promise<TaskTypeEntity[]> {
		return this.request<TaskTypeEntity[]>("/api/task-types");
	}

	async listPriorities(): Promise<TaskPriorityEntity[]> {
		return this.request<TaskPriorityEntity[]>("/api/task-priorities");
	}
}

export class BoardAPI extends BaseAPI {
	async listBoards(
		params: URLSearchParams = new URLSearchParams(),
	): Promise<Board[]> {
		return this.request<Board[]>(`/api/boards?${params.toString()}`);
	}

	async getBoard(idOrSlug: string): Promise<Board> {
		try {
			// Try slug-based route first
			return await this.request<Board>(`/api/b/${idOrSlug}`);
		} catch (error: unknown) {
			const apiError = error as APIErrorResponse;
			if (apiError?.status === 404) {
				// If not found by slug, try ID-based route
				return await this.request<Board>(`/api/boards/${idOrSlug}`);
			}
			throw error;
		}
	}

	async createBoard(board: Partial<Board>): Promise<Board> {
		return this.request<Board>("/api/boards", {
			method: "POST",
			body: JSON.stringify(board),
		});
	}

	async deleteBoard(id: string): Promise<void> {
		try {
			await this.request<void>(`/api/boards/${id}`, {
				method: "DELETE",
			});
		} catch (error: unknown) {
			const apiError = error as APIErrorResponse;
			if (apiError?.status === 404) {
				// Board already deleted or doesn't exist
				return;
			}
			throw error;
		}
	}

	async listAllBoards(): Promise<Board[]> {
		return this.request<Board[]>("/api/boards?list=all");
	}

	async updateBoard(
		id: string,
		updates: { is_public: boolean; is_active?: boolean },
	): Promise<Board> {
		return this.request<Board>(`/api/boards/${id}`, {
			method: "PUT",
			body: JSON.stringify(updates),
		});
	}
}

export class AuthAPI extends BaseAPI {
	async register(data: UserCreate): Promise<User> {
		return this.request<User>("/api/auth/register", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async login(data: UserLogin): Promise<LoginResponse> {
		return this.request<LoginResponse>("/api/auth/login", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
		const response = await this.request<LoginResponse>("/api/auth/refresh", {
			method: "POST",
			body: JSON.stringify({ refreshToken }),
		});

		return {
			token: response.token,
			expires_in: response.expires_in,
			user: response.user,
		};
	}

	async searchUsers(query: string): Promise<User[]> {
		return this.request<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
	}
}

// Convert userAPI to a class for consistency with other APIs
export class UserAPI extends BaseAPI {
	async listUsers(): Promise<User[]> {
		return this.request<User[]>("/api/users");
	}

	async updateUser(
		id: string,
		updates: { role: "user" | "admin" | "super_admin"; is_active?: boolean },
	): Promise<User> {
		return this.request<User>(`/api/users/${id}`, {
			method: "PATCH",
			body: JSON.stringify(updates),
		});
	}

	async searchUsers(query: string): Promise<User[]> {
		return this.request<User[]>(
			`/api/users/search?q=${encodeURIComponent(query)}`,
		);
	}

	async deleteUser(id: string): Promise<void> {
		return this.request<void>(`/api/users/${id}`, {
			method: "DELETE",
		});
	}
}

// Create and export API instances
export const taskAPI = new TaskAPI();
export const boardAPI = new BoardAPI();
export const authAPI = new AuthAPI();
export const userAPI = new UserAPI();
