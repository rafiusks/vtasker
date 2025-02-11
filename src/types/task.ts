export interface TaskType {
	id: number;
	name: string;
	color: string;
	icon: string;
}

export interface TaskRelationships {
	assignee_id?: string;
	board_id: string;
	parent_id?: string;
	children_ids?: string[];
	linked_task_ids?: string[];
}

export interface TaskMetadata {
	labels?: string[];
	due_date?: string;
	estimated_time?: number;
	spent_time?: number;
	custom_fields?: Record<string, string | number | boolean>;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	content?: string;
	status_id: number;
	priority_id: number;
	type_id: number;
	order: number;
	type: TaskType;
	relationships?: TaskRelationships;
	metadata?: TaskMetadata;
	created_at: string;
	updated_at: string;
}

export interface TaskStatus {
	id: number;
	name: string;
	columnId: string;
	color: string;
}

export interface TaskPriority {
	id: number;
	name: string;
	color: string;
	icon: string;
}

export const TASK_STATUS: Record<string, TaskStatus> = {
	TODO: {
		id: 1,
		name: "To Do",
		columnId: "todo",
		color: "bg-gray-100",
	},
	IN_PROGRESS: {
		id: 2,
		name: "In Progress",
		columnId: "in-progress",
		color: "bg-blue-100",
	},
	IN_REVIEW: {
		id: 3,
		name: "In Review",
		columnId: "in-review",
		color: "bg-yellow-100",
	},
	DONE: {
		id: 4,
		name: "Done",
		columnId: "done",
		color: "bg-green-100",
	},
};
