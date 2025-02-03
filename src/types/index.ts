/**
 * Core type definitions for vTasker
 */

// Task related types
export type TaskStatusCode = "backlog" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "normal" | "high";
export type TaskType = "feature" | "bug" | "docs" | "chore";

export interface TaskStatus {
	id: number;
	code: TaskStatusCode;
	name: string;
	description?: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface TaskPriorityEntity {
	id: number;
	code: TaskPriority;
	name: string;
	description?: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface AcceptanceCriterion {
	id: string;
	description: string;
	completed: boolean;
	completed_at: string | null;
	completed_by: string | null;
	created_at: string;
	updated_at: string;
	order: number;
	category?: string;
	notes?: string;
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

export interface Task {
	id: string;
	external_id: string;
	title: string;
	description: string;
	status_id: number;
	status?: TaskStatus;
	priority_id: number;
	priority?: TaskPriorityEntity;
	type: TaskType;
	order: number;
	content: TaskContent;
	relationships: TaskRelationships;
	metadata: TaskMetadata;
	progress: TaskProgress;
	status_history?: StatusChange[];
	labels?: string[];
	created_at?: string;
	updated_at?: string;
}

export interface StatusChange {
	task_id: string;
	from_status_id: number;
	to_status_id: number;
	from_status?: TaskStatus;
	to_status?: TaskStatus;
	comment?: string;
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
	status_id: number;
	priority_id: number;
	type: TaskType;
	order: number;
	content: TaskContent;
	relationships: TaskRelationships;
	metadata: TaskMetadata;
}
