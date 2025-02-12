/**
 * Core type definitions for vTasker
 */

import type {
	TaskStatusId,
	TaskPriorityId,
	TaskTypeId,
	TaskStatusEntity,
	TaskStatusUIType,
	TaskPriorityEntity,
	TaskTypeEntity,
} from "./typeReference";

// Re-export types from typeReference
export type {
	TaskStatusId,
	TaskPriorityId,
	TaskTypeId,
	TaskStatusEntity,
	TaskStatusUIType,
	TaskPriorityEntity,
	TaskTypeEntity,
};

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
	code: string;
	name: string;
	description?: string;
	color?: string;
	display_order: number;
	created_at?: string;
	updated_at?: string;
}

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

export interface BaseTask {
	id: string;
	title: string;
	description: string;
	order: number;
	content: TaskContent;
	relationships: TaskRelationships;
	metadata?: TaskMetadata;
	progress: TaskProgress;
}

// Task type used in the application
export interface Task {
	id: string;
	title: string;
	description: string;
	status_id: number;
	status?: {
		id: number;
		code: string;
		name: string;
		display_order: number;
	};
	priority_id: number;
	priority?: {
		id: number;
		name: string;
		display_order: number;
	};
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
	from_status?: {
		id: number;
		code: string;
		name: string;
		display_order: number;
	};
	to_status?: {
		id: number;
		code: string;
		name: string;
		display_order: number;
	};
	comment?: string;
	timestamp: string;
	changed_at: string;
}

// Board related types
export type BoardType = "project" | "team" | "personal";
export type BoardStatus = "active" | "archived";

export interface BoardColumn {
	id: string;
	name: string;
	description?: string;
	limit?: number;
}

export interface Board {
	id: string;
	name: string;
	description: string;
	slug: string;
	is_public: boolean;
	owner_id?: string;
	columns: BoardColumn[];
	tasks?: Task[];
	created_at: string;
	updated_at: string;
}

// Query types
export interface TaskQuery {
	status?: string;
	priority?: string;
	type?: string;
	labels?: string[];
	board?: string;
	column?: string;
}

export interface BoardQuery {
	name?: string;
}

// AI Integration types
export interface AIMetadata {
	complexity: number; // 1-10
	required_skills: string[];
	context_needed: "minimal" | "moderate" | "extensive";
	estimated_time: string; // e.g., "2h", "3d"
	task_nature: string;
	dependencies_graph: string[];
	related_components: string[];
}

export interface AIProgress {
	last_action: string;
	action_type: string;
	action_summary: string;
	next_steps: string[];
	blockers: string[];
	insights: string[];
	timestamp: string;
}

// Storage types
export interface StorageAdapter {
	readTask(id: string): Promise<Task>;
	writeTask(id: string, task: Task): Promise<void>;
	readBoard(id: string): Promise<Board>;
	writeBoard(id: string, board: Board): Promise<void>;
	listTasks(query?: TaskQuery): Promise<Task[]>;
	listBoards(query?: BoardQuery): Promise<Board[]>;
	deleteTask(id: string): Promise<void>;
	deleteBoard(id: string): Promise<void>;
}

export interface TaskFormData {
	title: string;
	description: string;
	status_id: string;
	priority_id: string;
	type_id: string;
	order: number;
	content: TaskContent;
	relationships: TaskRelationships;
	metadata?: {
		board?: string;
		column?: string;
	};
}
