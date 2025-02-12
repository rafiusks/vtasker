/**
 * Type Reference for vTasker
 * This file serves as the single source of truth for type definitions and conversions
 * between frontend and backend representations.
 */

import type { TaskStatus, TaskPriority, TaskType } from "./index";

// ============================================================================
// Core Type Definitions
// ============================================================================

// Simple numeric IDs
export type TaskStatusId = number;
export type TaskPriorityId = number;
export type TaskTypeId = number;

// API Types
export type TaskStatusEntity = TaskStatus;
export type TaskPriorityEntity = TaskPriority;
export type TaskTypeEntity = TaskType;

// UI Types
export interface TaskStatusUI {
	id: number;
	code: string;
	name: string;
	color: string;
	display_order: number;
}

export type TaskStatusUIType = TaskStatusUI;

// Constants
export const TASK_STATUS: Record<string, TaskStatusUI> = {};

// This function will be used to initialize the task statuses
export async function initializeTaskStatuses(statuses: TaskStatusEntity[]) {
	console.log("Initializing task statuses with:", statuses);

	// Clear existing statuses
	for (const key of Object.keys(TASK_STATUS)) {
		delete TASK_STATUS[key];
	}

	// Add new statuses
	for (const status of statuses) {
		const key = status.code.toUpperCase();
		TASK_STATUS[key] = {
			id: status.id,
			code: status.code,
			name: status.name,
			color: status.color,
			display_order: status.display_order,
		};
	}

	console.log("Task statuses initialized:", TASK_STATUS);
}

// Maps will be initialized after loading statuses
export const STATUS_MAP = new Map<number, TaskStatusUI>();

export function updateStatusMap() {
	console.log("Updating status map");
	STATUS_MAP.clear();
	for (const status of Object.values(TASK_STATUS)) {
		STATUS_MAP.set(status.id, status);
	}
	console.log("Status map updated:", STATUS_MAP);
}

// Type guard for status IDs
export function isTaskStatusId(value: unknown): value is number {
	return typeof value === "number" && STATUS_MAP.has(value);
}

// Get status by ID
export function getTaskStatus(id: number): TaskStatusUI | undefined {
	return STATUS_MAP.get(id);
}

export const TASK_PRIORITY = {
	LOW: {
		id: 1,
		name: "Low",
		display_order: 1,
	} as TaskPriorityEntity,
	NORMAL: {
		id: 2,
		name: "Normal",
		display_order: 2,
	} as TaskPriorityEntity,
	HIGH: {
		id: 3,
		name: "High",
		display_order: 3,
	} as TaskPriorityEntity,
} as const;

export const TASK_TYPE = {
	FEATURE: {
		id: 1,
		code: "feature",
		name: "Feature",
		display_order: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as TaskTypeEntity,
	BUG: {
		id: 2,
		code: "bug",
		name: "Bug",
		display_order: 2,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as TaskTypeEntity,
	DOCS: {
		id: 3,
		code: "docs",
		name: "Documentation",
		display_order: 3,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as TaskTypeEntity,
	CHORE: {
		id: 4,
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

export function isTaskPriorityId(value: unknown): value is number {
	return typeof value === "number" && [1, 2, 3].includes(value);
}

export function isTaskTypeId(value: unknown): value is number {
	return typeof value === "number" && [1, 2, 3, 4].includes(value);
}

export function isTaskTypeCode(
	code: string,
): code is "feature" | "bug" | "docs" | "chore" {
	return ["feature", "bug", "docs", "chore"].includes(code);
}

export function isTaskStatusUI(value: unknown): value is TaskStatusUIType {
	if (!value || typeof value !== "object") return false;
	const status = value as Partial<TaskStatusUI>;
	return (
		isTaskStatusId(status.id) &&
		typeof status.code === "string" &&
		typeof status.name === "string" &&
		typeof status.color === "string" &&
		typeof status.display_order === "number" &&
		Object.values(TASK_STATUS).some(
			(s) =>
				s.id === status.id &&
				s.code === status.code &&
				s.name === status.name &&
				s.color === status.color &&
				s.display_order === status.display_order,
		)
	);
}

// ============================================================================
// Lookup Maps
// ============================================================================

export const PRIORITY_MAP = new Map(
	Object.values(TASK_PRIORITY).map((priority) => [priority.id, priority]),
) as ReadonlyMap<number, TaskPriorityEntity>;

export const TYPE_MAP = new Map(
	Object.values(TASK_TYPE).map((type) => [type.id, type]),
) as ReadonlyMap<number, TaskTypeEntity>;

// ============================================================================
// Conversion Utilities
// ============================================================================

export function getTaskPriority(id: number): TaskPriorityEntity | undefined {
	switch (id) {
		case 1:
			return TASK_PRIORITY.LOW;
		case 2:
			return TASK_PRIORITY.NORMAL;
		case 3:
			return TASK_PRIORITY.HIGH;
		default:
			return undefined;
	}
}

export function getTaskType(id: number): TaskTypeEntity | undefined {
	switch (id) {
		case 1:
			return TASK_TYPE.FEATURE;
		case 2:
			return TASK_TYPE.BUG;
		case 3:
			return TASK_TYPE.DOCS;
		case 4:
			return TASK_TYPE.CHORE;
		default:
			return undefined;
	}
}

// ============================================================================
// UI Components Options
// ============================================================================

export const SELECT_OPTIONS = {
	get STATUS() {
		return Object.values(TASK_STATUS).map((s) => ({
			value: String(s.id),
			label: s.name,
		}));
	},
	get PRIORITY() {
		return Object.values(TASK_PRIORITY).map((p) => ({
			value: String(p.id),
			label: p.name,
		}));
	},
	get TYPE() {
		return Object.values(TASK_TYPE).map((t) => ({
			value: String(t.id),
			label: t.name,
		}));
	},
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_VALUES = {
	get STATUS() {
		const firstStatus = Object.values(TASK_STATUS)[0];
		if (!firstStatus) {
			throw new Error("No task statuses available");
		}
		return firstStatus;
	},
	PRIORITY: TASK_PRIORITY.NORMAL,
	TYPE: TASK_TYPE.FEATURE,
} as const;
