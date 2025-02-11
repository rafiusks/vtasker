export interface TaskType {
	id: number;
	code: string;
	name: string;
	description?: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface TaskContent {
	description: string;
	acceptance_criteria: AcceptanceCriterion[];
	implementation_details?: string;
	notes?: string;
	attachments: string[];
	due_date?: string;
	assignee?: string;
}

export interface TaskRelationships {
	parent?: string;
	dependencies: string[];
	labels: string[];
}

export interface TaskMetadata {
	created_at: string;
	updated_at: string;
	board?: string;
	column?: string;
}

export interface TaskProgress {
	acceptance_criteria: {
		total: number;
		completed: number;
	};
	percentage: number;
}

export interface TaskStatus {
	id: number;
	code: string;
	name: string;
	description?: string;
	color: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface TaskPriority {
	id: number;
	name: string;
	display_order: number;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	status_id: number;
	status?: TaskStatus;
	priority_id: number;
	priority?: TaskPriority;
	type_id: number;
	type?: TaskType;
	order: number;
	content?: TaskContent;
	relationships: TaskRelationships;
	metadata: TaskMetadata;
	progress: TaskProgress;
	status_history?: StatusChange[];
	created_at: string;
	updated_at: string;
}

export interface AcceptanceCriterion {
	id: string;
	description: string;
	completed: boolean;
	completed_at?: string;
	completed_by?: string;
	created_at: string;
	updated_at: string;
	order: number;
	category?: string;
	notes?: string;
}

export interface StatusChange {
	task_id: string;
	from_status_id: number;
	to_status_id: number;
	from_status?: TaskStatus;
	to_status?: TaskStatus;
	comment?: string;
	timestamp: string;
	changed_at: string;
}

// Default task statuses
export const DEFAULT_TASK_STATUSES: TaskStatus[] = [
	{
		id: 1,
		code: "todo",
		name: "To Do",
		color: "bg-gray-100",
		display_order: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 2,
		code: "in_progress",
		name: "In Progress",
		color: "bg-blue-100",
		display_order: 2,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 3,
		code: "in_review",
		name: "In Review",
		color: "bg-yellow-100",
		display_order: 3,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 4,
		code: "done",
		name: "Done",
		color: "bg-green-100",
		display_order: 4,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
];
