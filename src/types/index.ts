/**
 * Core type definitions for vTasker
 */

import type {
	TaskStatusId,
	TaskPriorityId,
	TaskTypeId,
	TaskStatus,
	TaskPriority,
	TaskType,
} from "./typeReference";

// Re-export the type aliases we need
export type {
	TaskStatusId,
	TaskPriorityId,
	TaskTypeId,
	TaskStatus,
	TaskPriority,
	TaskType,
};

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
	metadata: TaskMetadata;
	progress: TaskProgress;
}

// Raw task from API with numeric IDs
export interface RawTask extends BaseTask {
	status_id: number;
	priority_id: number;
	type_id: number;
}

// Validated task with branded type IDs
export interface ValidatedTask extends BaseTask {
	status_id: TaskStatusId;
	priority_id: TaskPriorityId;
	type_id: TaskTypeId;

	// Optional references to full entities
	status?: TaskStatus;
	priority?: TaskPriority;
	type?: TaskType;
}

// Task type used in the application
export interface Task {
	id: string;
	title: string;
	description: string;
	status_id: string;
	status?: TaskStatus;
	priority_id: string;
	priority?: TaskPriority;
	type_id: string;
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
	from_status_id: TaskStatusId;
	to_status_id: TaskStatusId;
	from_status?: TaskStatus;
	to_status?: TaskStatus;
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
	columns: BoardColumn[];
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
	status_id: TaskStatusId;
	priority_id: TaskPriorityId;
	type_id: TaskTypeId;
	order: number;
	content: TaskContent;
	relationships: TaskRelationships;
	metadata: TaskMetadata;
}
