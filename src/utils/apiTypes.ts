import type {
	Task,
	TaskContent,
	TaskRelationships,
	TaskMetadata,
	TaskStatus,
	TaskTypeCode,
	StatusChange,
} from "../types";
import { TASK_STATUS, type TaskStatusUIType } from "../types/typeReference";
import type {
	ApiTask,
	ApiStatusChange,
	ApiTaskStatus,
} from "../api/types";

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
function getStatusFromId(id: string | number): TaskStatusUIType | undefined {
	const numericId = typeof id === "string" ? Number(id) : id;
	const status = Object.values(TASK_STATUS).find((s) => s.id === numericId);
	return status;
}

// Helper function to convert API status to domain status
function convertApiStatus(apiStatus: ApiTaskStatus): TaskStatus {
	return {
		id: apiStatus.id,
		code: apiStatus.code,
		name: apiStatus.name,
		label: apiStatus.name,
		description: apiStatus.description,
		color: apiStatus.color || "#6B7280",
		display_order: apiStatus.display_order,
		created_at: apiStatus.created_at,
		updated_at: apiStatus.updated_at,
	};
}

// Helper function to convert API status change to domain status change
function convertApiStatusChange(apiChange: ApiStatusChange): StatusChange {
	return {
		task_id: apiChange.task_id,
		from_status_id: apiChange.from_status_id,
		to_status_id: apiChange.to_status_id,
		from_status: apiChange.from_status ? convertApiStatus(apiChange.from_status) : undefined,
		to_status: apiChange.to_status ? convertApiStatus(apiChange.to_status) : undefined,
		comment: apiChange.comment,
		timestamp: apiChange.timestamp,
		changed_at: apiChange.changed_at,
	};
}

export function convertAPITaskToTask(apiTask: ApiTask): Task {
	const content: TaskContent = {
		description: apiTask.content.description,
		acceptance_criteria: apiTask.content.acceptance_criteria.map((ac) => ({
			id: ac.id,
			description: ac.description,
			completed: ac.completed,
			completed_at: ac.completed_at ?? undefined,
			completed_by: ac.completed_by ?? undefined,
			created_at: ac.created_at,
			updated_at: ac.updated_at,
			order: ac.order,
			category: ac.category ?? undefined,
			notes: ac.notes ?? undefined,
		})),
		implementation_details: apiTask.content.implementation_details,
		notes: apiTask.content.notes,
		attachments: apiTask.content.attachments,
		due_date: apiTask.content.due_date ?? undefined,
		assignee: apiTask.content.assignee ?? undefined,
	};

	const relationships: TaskRelationships = {
		parent: apiTask.relationships.parent ?? undefined,
		dependencies: apiTask.relationships.dependencies,
		labels: apiTask.relationships.labels,
	};

	const metadata: TaskMetadata = {
		created_at: apiTask.metadata.created_at,
		updated_at: apiTask.metadata.updated_at,
		board: apiTask.metadata.board ?? undefined,
		column: apiTask.metadata.column ?? undefined,
	};

	const task: Task = {
		id: apiTask.id,
		title: apiTask.title,
		description: apiTask.description,
		status_id: Number(apiTask.status_id),
		priority_id: Number(apiTask.priority_id),
		type_id: Number(apiTask.type_id),
		order: apiTask.order,
		content,
		relationships,
		metadata,
		progress: apiTask.progress,
		status: apiTask.status ? convertApiStatus(apiTask.status) : undefined,
		type: apiTask.type
			? {
					id: Number(apiTask.type.id),
					code: apiTask.type.code as TaskTypeCode,
					name: apiTask.type.name,
					description: apiTask.type.description,
					display_order: apiTask.type.display_order,
					created_at: apiTask.type.created_at,
					updated_at: apiTask.type.updated_at,
			  }
			: undefined,
		status_history: apiTask.status_history?.map(convertApiStatusChange),
		created_at: apiTask.created_at,
		updated_at: apiTask.updated_at,
	};

	return task;
}

export function ensureTaskArray(tasks: unknown): Task[] {
	if (!Array.isArray(tasks)) {
		return [];
	}
	return tasks.map((task) => {
		if (typeof task !== "object" || !task) {
			throw new Error("Invalid task data");
		}
		return convertAPITaskToTask(task as ApiTask);
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
		const apiStatus = status as ApiTaskStatus;
		const uiStatus = getStatusFromId(apiStatus.id);
		if (!uiStatus) {
			throw new Error(`Invalid status ID: ${apiStatus.id}`);
		}
		return uiStatus;
	});
}
