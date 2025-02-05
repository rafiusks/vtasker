/**
 * Type Reference for vTasker
 * This file serves as the single source of truth for type definitions and conversions
 * between frontend and backend representations.
 */

// ============================================================================
// Branded Types
// ============================================================================

declare const __brand: unique symbol;

interface Brand<T> {
	readonly [__brand]: T;
}

type Branded<T, B> = T & Brand<B>;

// ============================================================================
// Core Type Definitions
// ============================================================================

// Status ID Brands
type BacklogStatusBrand = { readonly type: "BACKLOG_STATUS" };
type InProgressStatusBrand = { readonly type: "IN_PROGRESS_STATUS" };
type ReviewStatusBrand = { readonly type: "REVIEW_STATUS" };
type DoneStatusBrand = { readonly type: "DONE_STATUS" };

// Priority ID Brands
type LowPriorityBrand = { readonly type: "LOW_PRIORITY" };
type NormalPriorityBrand = { readonly type: "NORMAL_PRIORITY" };
type HighPriorityBrand = { readonly type: "HIGH_PRIORITY" };

// Type ID Brands
type FeatureTypeBrand = { readonly type: "FEATURE_TYPE" };
type BugTypeBrand = { readonly type: "BUG_TYPE" };
type DocsTypeBrand = { readonly type: "DOCS_TYPE" };
type ChoreTypeBrand = { readonly type: "CHORE_TYPE" };

// Branded IDs
export type BacklogStatusId = Branded<number, BacklogStatusBrand>;
export type InProgressStatusId = Branded<number, InProgressStatusBrand>;
export type ReviewStatusId = Branded<number, ReviewStatusBrand>;
export type DoneStatusId = Branded<number, DoneStatusBrand>;

export type LowPriorityId = Branded<string, LowPriorityBrand>;
export type NormalPriorityId = Branded<string, NormalPriorityBrand>;
export type HighPriorityId = Branded<string, HighPriorityBrand>;

export type FeatureTypeId = Branded<string, FeatureTypeBrand>;
export type BugTypeId = Branded<string, BugTypeBrand>;
export type DocsTypeId = Branded<string, DocsTypeBrand>;
export type ChoreTypeId = Branded<string, ChoreTypeBrand>;

// Union Types
export type TaskStatusId =
	| BacklogStatusId
	| InProgressStatusId
	| ReviewStatusId
	| DoneStatusId;
export type TaskPriorityId = LowPriorityId | NormalPriorityId | HighPriorityId;
export type TaskTypeId = FeatureTypeId | BugTypeId | DocsTypeId | ChoreTypeId;

// Base Interfaces
interface BaseEntity<T> {
	readonly id: T;
	readonly code: string;
	readonly label: string;
}

interface BaseTaskStatus<T extends TaskStatusId> extends BaseEntity<T> {
	readonly columnId: string;
}

// Status Interfaces
export interface TaskStatus {
	id: string;
	code: string;
	name: string;
	description?: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

// Priority Interfaces
export interface TaskPriorityEntity {
	readonly id: TaskPriorityId;
	readonly code: "low" | "normal" | "high";
	readonly name: string;
	readonly description?: string;
	readonly display_order: number;
	readonly created_at: string;
	readonly updated_at: string;
}

// Type Interfaces
export interface TaskTypeEntity {
	readonly id: TaskTypeId;
	readonly code: "feature" | "bug" | "docs" | "chore";
	readonly name: string;
	readonly description?: string;
	readonly display_order: number;
	readonly created_at: string;
	readonly updated_at: string;
}

// Union Types
export type TaskStatus =
	| BacklogStatus
	| InProgressStatus
	| ReviewStatus
	| DoneStatus;
export type TaskPriority = TaskPriorityEntity;
export type TaskType = TaskTypeEntity;

// ============================================================================
// Constants
// ============================================================================

export const TASK_STATUS = {
	BACKLOG: {
		id: 1 as BacklogStatusId,
		code: "backlog",
		label: "Backlog",
		columnId: "backlog-column",
	} as BacklogStatus,
	IN_PROGRESS: {
		id: 2 as InProgressStatusId,
		code: "in-progress",
		label: "In Progress",
		columnId: "in-progress-column",
	} as InProgressStatus,
	REVIEW: {
		id: 3 as ReviewStatusId,
		code: "review",
		label: "Review",
		columnId: "review-column",
	} as ReviewStatus,
	DONE: {
		id: 4 as DoneStatusId,
		code: "done",
		label: "Done",
		columnId: "done-column",
	} as DoneStatus,
} as const;

export const TASK_PRIORITY = {
	LOW: {
		id: "low" as LowPriorityId,
		code: "low",
		name: "Low",
		display_order: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as TaskPriorityEntity,
	NORMAL: {
		id: "normal" as NormalPriorityId,
		code: "normal",
		name: "Normal",
		display_order: 2,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as TaskPriorityEntity,
	HIGH: {
		id: "high" as HighPriorityId,
		code: "high",
		name: "High",
		display_order: 3,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as TaskPriorityEntity,
} as const;

export const TASK_TYPE = {
	FEATURE: {
		id: "feature" as FeatureTypeId,
		code: "feature",
		name: "Feature",
		display_order: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as TaskTypeEntity,
	BUG: {
		id: "bug" as BugTypeId,
		code: "bug",
		name: "Bug",
		display_order: 2,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as TaskTypeEntity,
	DOCS: {
		id: "docs" as DocsTypeId,
		code: "docs",
		name: "Documentation",
		display_order: 3,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as TaskTypeEntity,
	CHORE: {
		id: "chore" as ChoreTypeId,
		code: "chore",
		name: "Chore",
		display_order: 4,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as TaskTypeEntity,
} as const;

// ============================================================================
// Type Guards
// ============================================================================

export function isTaskStatusId(value: unknown): value is TaskStatusId {
	return typeof value === "number" && [1, 2, 3, 4].includes(value);
}

export function isTaskPriorityId(value: unknown): value is TaskPriorityId {
	return typeof value === "string" && ["low", "normal", "high"].includes(value);
}

export function isTaskTypeId(value: unknown): value is TaskTypeId {
	return (
		typeof value === "string" &&
		["feature", "bug", "docs", "chore"].includes(value)
	);
}

export function isTaskStatus(value: unknown): value is TaskStatus {
	if (!value || typeof value !== "object") return false;
	const status = value as Partial<TaskStatus>;
	return (
		isTaskStatusId(status.id) &&
		typeof status.code === "string" &&
		typeof status.label === "string" &&
		typeof status.columnId === "string" &&
		Object.values(TASK_STATUS).some(
			(s) =>
				s.id === status.id &&
				s.code === status.code &&
				s.label === status.label &&
				s.columnId === status.columnId,
		)
	);
}

// ============================================================================
// Lookup Maps
// ============================================================================

export const STATUS_MAP = new Map(
	Object.values(TASK_STATUS).map((status) => [status.id, status]),
) as ReadonlyMap<TaskStatusId, TaskStatus>;

export const PRIORITY_MAP = new Map(
	Object.values(TASK_PRIORITY).map((priority) => [priority.id, priority]),
) as ReadonlyMap<TaskPriorityId, TaskPriority>;

export const TYPE_MAP = new Map(
	Object.values(TASK_TYPE).map((type) => [type.id, type]),
) as ReadonlyMap<TaskTypeId, TaskType>;

// ============================================================================
// Conversion Utilities
// ============================================================================

export function getTaskStatus(id: number): TaskStatus | undefined {
	switch (id) {
		case 1:
			return {
				id: id as BacklogStatusId,
				code: "backlog",
				label: "Backlog",
				columnId: "backlog-column",
			};
		case 2:
			return {
				id: id as InProgressStatusId,
				code: "in-progress",
				label: "In Progress",
				columnId: "in-progress-column",
			};
		case 3:
			return {
				id: id as ReviewStatusId,
				code: "review",
				label: "Review",
				columnId: "review-column",
			};
		case 4:
			return {
				id: id as DoneStatusId,
				code: "done",
				label: "Done",
				columnId: "done-column",
			};
		default:
			return undefined;
	}
}

export function getTaskPriority(id: string): TaskPriorityEntity | undefined {
	switch (id) {
		case "low":
			return {
				id: id as LowPriorityId,
				code: "low",
				name: "Low",
				display_order: 1,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};
		case "normal":
			return {
				id: id as NormalPriorityId,
				code: "normal",
				name: "Normal",
				display_order: 2,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};
		case "high":
			return {
				id: id as HighPriorityId,
				code: "high",
				name: "High",
				display_order: 3,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};
		default:
			return undefined;
	}
}

export function getTaskType(id: string): TaskTypeEntity | undefined {
	switch (id) {
		case "feature":
			return {
				id: id as FeatureTypeId,
				code: "feature",
				name: "Feature",
				display_order: 1,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};
		case "bug":
			return {
				id: id as BugTypeId,
				code: "bug",
				name: "Bug",
				display_order: 2,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};
		case "docs":
			return {
				id: id as DocsTypeId,
				code: "docs",
				name: "Documentation",
				display_order: 3,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};
		case "chore":
			return {
				id: id as ChoreTypeId,
				code: "chore",
				name: "Chore",
				display_order: 4,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};
		default:
			return undefined;
	}
}

export function createTaskStatusId(value: number): TaskStatusId | undefined {
	if (!isTaskStatusId(value)) return undefined;
	return value as TaskStatusId;
}

export function createTaskPriorityId(
	value: string,
): TaskPriorityId | undefined {
	if (!isTaskPriorityId(value)) return undefined;
	return value as TaskPriorityId;
}

export function createTaskTypeId(value: string): TaskTypeId | undefined {
	if (!isTaskTypeId(value)) return undefined;
	return value as TaskTypeId;
}

// ============================================================================
// UI Components Options
// ============================================================================

export const SELECT_OPTIONS = {
	STATUS: Object.values(TASK_STATUS).map((s) => ({
		value: String(s.id),
		label: s.label,
	})),
	PRIORITY: Object.values(TASK_PRIORITY).map((p) => ({
		value: String(p.id),
		label: p.name,
	})),
	TYPE: Object.values(TASK_TYPE).map((t) => ({
		value: String(t.id),
		label: t.name,
	})),
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_VALUES = {
	STATUS: TASK_STATUS.BACKLOG,
	PRIORITY: TASK_PRIORITY.NORMAL,
	TYPE: TASK_TYPE.FEATURE,
} as const;
