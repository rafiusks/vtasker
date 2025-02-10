import type {
	Task,
	TaskContent,
	TaskRelationships,
	TaskMetadata,
	TaskProgress,
	StatusChange,
} from "../types";
import { TASK_STATUS, type TaskStatusUIType } from "../types/typeReference";

// API Types
export interface APITaskStatus {
	id: number;
	code: string;
	name: string;
	display_order: number;
}

export interface APITaskPriority {
	id: number;
	name: string;
	display_order: number;
}

export interface APITaskType {
	id: number;
	code: string;
	name: string;
	description?: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

// API Response Types
export interface APITask {
	id: string;
	title: string;
	description: string;
	status_id: number;
	status?: APITaskStatus;
	priority_id: number;
	priority?: APITaskPriority;
	type_id: number;
	type?: APITaskType;
	order: number;
	content: TaskContent;
	relationships: TaskRelationships;
	metadata: TaskMetadata;
	progress: TaskProgress;
	status_history?: StatusChange[];
	created_at: string;
	updated_at: string;
}

// Constants and Types
const STATUS_CODES = ["backlog", "in-progress", "done"] as const;
type ValidStatusCode = (typeof STATUS_CODES)[number];

const TYPE_CODES = ["feature", "bug", "docs", "chore"] as const;
type ValidTypeCode = (typeof TYPE_CODES)[number];

// Type Guards
export function isTaskStatusCode(code: string): code is ValidStatusCode {
	return STATUS_CODES.includes(code as ValidStatusCode);
}

export function isTaskTypeCode(code: string): code is ValidTypeCode {
	return TYPE_CODES.includes(code as ValidTypeCode);
}

// Helper Functions
function getStatusFromId(id: number): TaskStatusUIType | undefined {
	const status = Object.values(TASK_STATUS).find((s) => s.id === id);
	return status;
}

// Conversion Functions
export function convertAPITaskToTask(apiTask: APITask): Task {
	return {
		id: apiTask.id,
		title: apiTask.title,
		description: apiTask.description,
		status_id: apiTask.status_id,
		status: apiTask.status,
		priority_id: apiTask.priority_id,
		priority: apiTask.priority,
		type_id: apiTask.type_id,
		type: apiTask.type,
		order: apiTask.order,
		content: apiTask.content,
		relationships: apiTask.relationships,
		metadata: apiTask.metadata,
		progress: apiTask.progress,
		status_history: apiTask.status_history,
		created_at: apiTask.created_at,
		updated_at: apiTask.updated_at,
	};
}

export function ensureTaskArray(tasks: unknown): Task[] {
	if (!Array.isArray(tasks)) {
		return [];
	}
	return tasks.map((task) => {
		if (typeof task !== "object" || !task) {
			throw new Error("Invalid task data");
		}
		return convertAPITaskToTask(task as APITask);
	});
}

export function ensureTaskStatusArray(statuses: unknown): TaskStatusUIType[] {
	if (!Array.isArray(statuses)) {
		return [];
	}
	return statuses.map((status) => {
		if (typeof status !== "object" || !status) {
			throw new Error("Invalid status data");
		}
		const apiStatus = status as APITaskStatus;
		const uiStatus = getStatusFromId(apiStatus.id);
		if (!uiStatus) {
			throw new Error(`Invalid status ID: ${apiStatus.id}`);
		}
		return uiStatus;
	});
}
