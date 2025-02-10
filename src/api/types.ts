import type {
	Task,
	TaskContent,
	TaskRelationships,
	TaskMetadata,
	TaskStatus,
	TaskTypeEntity,
	TaskTypeCode,
	StatusChange,
} from "../types";

// Backend API types
export interface ApiTask {
	id: string;
	title: string;
	description: string;
	status_id: string;
	status?: ApiTaskStatus;
	priority_id: string;
	priority?: ApiTaskPriority;
	type_id: string;
	type?: ApiTaskType;
	order: number;
	content: ApiTaskContent;
	relationships: ApiTaskRelationships;
	metadata: ApiTaskMetadata;
	progress: ApiTaskProgress;
	status_history?: ApiStatusChange[];
	created_at: string;
	updated_at: string;
}

export interface ApiTaskStatus {
	id: string;
	code: string;
	name: string;
	description?: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface ApiTaskPriority {
	id: string;
	code: string;
	name: string;
	description?: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface ApiTaskType {
	id: string;
	code: string;
	name: string;
	description?: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface ApiTaskContent {
	description: string;
	acceptance_criteria: ApiAcceptanceCriterion[];
	implementation_details?: string;
	notes?: string;
	attachments: string[];
	due_date?: string | null;
	assignee?: string | null;
}

export interface ApiAcceptanceCriterion {
	id: string;
	description: string;
	completed: boolean;
	completed_at: string | null;
	completed_by: string | null;
	created_at: string;
	updated_at: string;
	order: number;
	category?: string | null;
	notes?: string | null;
}

export interface ApiTaskRelationships {
	parent?: string | null;
	dependencies: string[];
	labels: string[];
}

export interface ApiTaskMetadata {
	created_at: string;
	updated_at: string;
	board?: string | null;
	column?: string | null;
}

export interface ApiTaskProgress {
	acceptance_criteria: {
		total: number;
		completed: number;
	};
	percentage: number;
}

export interface ApiStatusChange {
	task_id: string;
	from_status_id: string;
	to_status_id: string;
	from_status?: ApiTaskStatus;
	to_status?: ApiTaskStatus;
	comment?: string;
	timestamp: string;
	changed_at: string;
}

// Conversion Functions
function convertApiStatusToTaskStatus(apiStatus: ApiTaskStatus): TaskStatus {
	return {
		...apiStatus,
		id: apiStatus.id,
		label: apiStatus.name, // Use name as label since ApiTaskStatus doesn't have label
	};
}

function convertApiTypeToTaskType(apiType: ApiTaskType): TaskTypeEntity {
	return {
		...apiType,
		id: Number(apiType.id),
		code: apiType.code as TaskTypeCode,
	};
}

function convertApiStatusChangeToStatusChange(
	apiChange: ApiStatusChange,
): StatusChange {
	return {
		...apiChange,
		from_status: apiChange.from_status
			? convertApiStatusToTaskStatus(apiChange.from_status)
			: undefined,
		to_status: apiChange.to_status
			? convertApiStatusToTaskStatus(apiChange.to_status)
			: undefined,
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
		status: apiTask.status
			? convertApiStatusToTaskStatus(apiTask.status)
			: undefined,
		type: apiTask.type ? convertApiTypeToTaskType(apiTask.type) : undefined,
		status_history: apiTask.status_history?.map(
			convertApiStatusChangeToStatusChange,
		),
		created_at: apiTask.created_at,
		updated_at: apiTask.updated_at,
	};

	return task;
}

export function convertTaskToApiTask(task: Task): ApiTask {
	if (!task.content) {
		throw new Error("Task content is required");
	}

	const apiTask: ApiTask = {
		id: task.id,
		title: task.title,
		description: task.description,
		status_id: String(task.status_id),
		priority_id: String(task.priority_id),
		type_id: String(task.type_id),
		order: task.order,
		content: {
			description: task.content.description,
			acceptance_criteria: task.content.acceptance_criteria.map((ac) => ({
				...ac,
				completed_at: ac.completed_at ?? null,
				completed_by: ac.completed_by ?? null,
				category: ac.category ?? null,
				notes: ac.notes ?? null,
			})),
			implementation_details: task.content.implementation_details,
			notes: task.content.notes,
			attachments: task.content.attachments ?? [],
			due_date: task.content.due_date ?? null,
			assignee: task.content.assignee ?? null,
		},
		relationships: {
			parent: task.relationships.parent ?? null,
			dependencies: task.relationships.dependencies,
			labels: task.relationships.labels,
		},
		metadata: {
			created_at: task.metadata.created_at,
			updated_at: task.metadata.updated_at,
			board: task.metadata.board ?? null,
			column: task.metadata.column ?? null,
		},
		progress: task.progress ?? {
			acceptance_criteria: { total: 0, completed: 0 },
			percentage: 0,
		},
		status: task.status
			? {
					...task.status,
					id: String(task.status.id),
				}
			: undefined,
		type: task.type
			? {
					...task.type,
					id: String(task.type.id),
				}
			: undefined,
		status_history: task.status_history?.map((change) => ({
			...change,
			from_status: change.from_status
				? {
						...change.from_status,
						id: String(change.from_status.id),
					}
				: undefined,
			to_status: change.to_status
				? {
						...change.to_status,
						id: String(change.to_status.id),
					}
				: undefined,
		})),
		created_at: task.created_at,
		updated_at: task.updated_at,
	};

	return apiTask;
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

export function ensureTaskStatusArray(statuses: unknown): string[] {
	if (!Array.isArray(statuses)) {
		return [];
	}
	return statuses.map((status) => {
		if (typeof status !== "object" || !status) {
			throw new Error("Invalid status data");
		}
		const apiStatus = status as ApiTaskStatus;
		return apiStatus.code;
	});
}
