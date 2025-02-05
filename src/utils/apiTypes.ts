import type {
	Task,
	TaskStatus,
	TaskPriority,
	TaskTypeCode,
	TaskTypeEntity,
	TaskContent,
	TaskRelationships,
	TaskMetadata,
	TaskProgress,
	StatusChange,
} from "../types";
import { TASK_STATUS, type TaskStatusId } from "../types/typeReference";

// API Response Types
export interface APITask {
	id: string;
	title: string;
	description: string;
	status_id: TaskStatusId;
	status?: {
		id: TaskStatusId;
		code: string;
		name: string;
		description?: string;
		display_order: number;
		created_at: string;
		updated_at: string;
	};
	priority_id: number;
	type_id: number;
	type?: {
		id: number;
		code: string;
		name: string;
		description?: string;
		display_order: number;
		created_at: string;
		updated_at: string;
	};
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
const STATUS_CODES = ["backlog", "in-progress", "review", "done"] as const;
type ValidStatusCode = (typeof STATUS_CODES)[number];

// Type Guards
export function isTaskStatusCode(code: string): code is ValidStatusCode {
	return STATUS_CODES.includes(code as ValidStatusCode);
}

export function isTaskPriority(value: number): boolean {
	return [1, 2, 3].includes(value);
}

export function isTaskTypeCode(code: string): boolean {
	return ["feature", "bug", "docs", "chore"].includes(code);
}

// Helper Functions
function getStatusFromTaskStatusId(
	id: TaskStatusId,
): (typeof TASK_STATUS)[keyof typeof TASK_STATUS] {
	switch (id) {
		case 1:
			return TASK_STATUS.BACKLOG;
		case 2:
			return TASK_STATUS.IN_PROGRESS;
		case 3:
			return TASK_STATUS.REVIEW;
		case 4:
			return TASK_STATUS.DONE;
		default:
			return TASK_STATUS.BACKLOG;
	}
}

function convertToTaskStatus(apiStatus: {
	id: TaskStatusId;
	code: string;
	name: string;
	description?: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}): (typeof TASK_STATUS)[keyof typeof TASK_STATUS] {
	return getStatusFromTaskStatusId(apiStatus.id);
}

function convertToTaskTypeEntity(apiType: {
	id: number;
	code: string;
	name: string;
	description?: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}): TaskTypeEntity {
	const validCode = isTaskTypeCode(apiType.code) ? apiType.code : "feature";
	return {
		id: apiType.id,
		code: validCode as TaskTypeCode,
		name: apiType.name,
		description: apiType.description,
		display_order: apiType.display_order,
		created_at: apiType.created_at,
		updated_at: apiType.updated_at,
	} as unknown as TaskTypeEntity;
}

// Conversion Functions
export function convertAPITaskToTask(apiTask: APITask): Task {
	const priority = isTaskPriority(apiTask.priority_id)
		? apiTask.priority_id
		: 2;

	const status = apiTask.status
		? convertToTaskStatus(apiTask.status)
		: undefined;
	const type = apiTask.type ? convertToTaskTypeEntity(apiTask.type) : undefined;

	return {
		id: apiTask.id,
		title: apiTask.title,
		description: apiTask.description,
		status_id: apiTask.status_id,
		status,
		priority_id: priority as unknown as TaskPriority,
		type_id: apiTask.type_id,
		type,
		order: apiTask.order,
		content: apiTask.content,
		relationships: apiTask.relationships,
		metadata: apiTask.metadata,
		progress: apiTask.progress,
		status_history: apiTask.status_history,
		created_at: apiTask.created_at,
		updated_at: apiTask.updated_at,
	} as unknown as Task;
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

export function ensureTaskStatusArray(
	statuses: unknown,
): (typeof TASK_STATUS)[keyof typeof TASK_STATUS][] {
	if (!Array.isArray(statuses)) {
		return [];
	}
	return statuses.map((status) => {
		if (typeof status !== "object" || !status) {
			throw new Error("Invalid status data");
		}
		const apiStatus = status as {
			id: TaskStatusId;
			code: string;
			name: string;
			display_order: number;
			created_at: string;
			updated_at: string;
			description?: string;
		};

		return getStatusFromTaskStatusId(apiStatus.id);
	});
}
