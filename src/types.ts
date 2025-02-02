/**
 * Core type definitions for vTasker
 */

// Task related types
export type TaskStatus = "backlog" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "normal" | "high";
export type TaskType = "feature" | "bug" | "docs" | "chore";

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
	attachments?: string[];
	due_date?: string;
	assignee?: string;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	type: TaskType;
	labels: string[];
	dependencies: string[];
	parent?: string;
	board?: string;
	column?: string;
	created_at: string;
	updated_at: string;
	order: number;
	content: TaskContent;
	status_history: Array<{
		from: TaskStatus;
		to: TaskStatus;
		timestamp: string;
		comment?: string;
	}>;
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
