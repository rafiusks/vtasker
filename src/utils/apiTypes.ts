import type {
	Task,
	TaskContent,
	TaskRelationships,
	TaskMetadata,
	TaskProgress,
	TaskStatus,
	TaskTypeEntity,
	TaskTypeCode,
} from "../types";
import { TASK_STATUS, type TaskStatusUIType } from "../types/typeReference";
import type {
	ApiTask,
	ApiAcceptanceCriterion,
	ApiStatusChange,
	ApiTaskStatus,
	ApiTaskType,
	ApiTaskPriority,
} from "../api/types";

// API Types
export interface APITaskPriority {
	id: number;
	name: string;
	display_order: number;
}

// API Response Types
export interface APITask {
	id: string;
	title: string;
	description: string;
	status_id: number;
	status?: ApiTaskStatus;
	priority_id: number;
	priority?: ApiTaskPriority;
	type_id: number;
	type?: ApiTaskType;
	order: number;
	content: TaskContent;
	relationships: TaskRelationships;
	metadata: TaskMetadata;
	progress: TaskProgress;
	status_history?: ApiStatusChange[];
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
function getStatusFromId(id: string | number): TaskStatusUIType | undefined {
	const numericId = typeof id === "string" ? Number(id) : id;
	const status = Object.values(TASK_STATUS).find((s) => s.id === numericId);
	return status;
}

// Conversion Functions
export function convertAPITaskToTask(apiTask: ApiTask): Task {
	const content: TaskContent = {
		description: apiTask.content.description,
		acceptance_criteria: apiTask.content.acceptance_criteria.map(
			(ac: ApiAcceptanceCriterion) => ({
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
			}),
		),
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

	const status: TaskStatus | undefined = apiTask.status
		? {
				id: String(apiTask.status.id),
				code: apiTask.status.code,
				name: apiTask.status.name,
				label: apiTask.status.name, // Use name as label if not provided
				description: apiTask.status.description ?? undefined,
				display_order: apiTask.status.display_order,
				created_at: apiTask.created_at,
				updated_at: apiTask.updated_at,
			}
		: undefined;

	const type: TaskTypeEntity | undefined = apiTask.type
		? {
				id: Number(apiTask.type.id),
				code: apiTask.type.code as TaskTypeCode,
				name: apiTask.type.name,
				description: apiTask.type.description,
				display_order: apiTask.type.display_order,
				created_at: apiTask.created_at,
				updated_at: apiTask.updated_at,
			}
		: undefined;

	return {
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
		status,
		type,
		created_at: apiTask.created_at,
		updated_at: apiTask.updated_at,
		status_history: apiTask.status_history?.map((change: ApiStatusChange) => ({
			...change,
			from_status: change.from_status
				? {
						...change.from_status,
						id: String(change.from_status.id),
						label: change.from_status.name,
						created_at: apiTask.created_at,
						updated_at: apiTask.updated_at,
					}
				: undefined,
			to_status: change.to_status
				? {
						...change.to_status,
						id: String(change.to_status.id),
						label: change.to_status.name,
						created_at: apiTask.created_at,
						updated_at: apiTask.updated_at,
					}
				: undefined,
		})),
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
