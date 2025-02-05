import type { Task, TaskStatus } from "../types";
import type { TaskUpdateRequest } from "../api/client";
import {
	isTaskStatusId,
	isTaskPriorityId,
	isTaskTypeId,
	getTaskStatus,
	getTaskPriority,
	getTaskType,
	type TaskStatusId,
	type TaskPriorityId,
	type TaskTypeId,
	type BacklogStatus,
	type InProgressStatus,
	type ReviewStatus,
	type DoneStatus,
} from "../types/typeReference";

// Constants for validation
const VALID_STATUS_CODES = ["backlog", "in-progress", "review", "done"];
const VALID_TYPE_CODES = ["feature", "bug", "docs", "chore"];

// Default values
const DEFAULT_STATUS = getTaskStatus(1);
const DEFAULT_PRIORITY = getTaskPriority("normal"); // Normal priority
const DEFAULT_TYPE = getTaskType("feature"); // Feature type

if (!DEFAULT_STATUS || !DEFAULT_PRIORITY || !DEFAULT_TYPE) {
	throw new Error("Failed to initialize default values");
}

// After this point, TypeScript knows these values are defined
const DEFAULTS = {
	STATUS: DEFAULT_STATUS,
	PRIORITY: DEFAULT_PRIORITY,
	TYPE: DEFAULT_TYPE,
} as const;

// Validation functions
export function isValidStatusCode(code: string): boolean {
	return VALID_STATUS_CODES.includes(code);
}

export function isValidTypeCode(code: string): boolean {
	return VALID_TYPE_CODES.includes(code);
}

// Type guards
export { isTaskStatusId, isTaskPriorityId, isTaskTypeId };

// Safe converters
export function ensureValidStatusId(value: string | number): TaskStatusId {
	const status = getTaskStatus(Number(value));
	if (!status) {
		throw new Error(`Invalid status ID: ${value}`);
	}
	return status.id;
}

export function ensureValidPriorityId(value: string | number): TaskPriorityId {
	const priority = getTaskPriority(Number(value));
	if (!priority) {
		throw new Error(`Invalid priority ID: ${value}`);
	}
	return priority.id;
}

export function ensureValidTypeId(value: string | number): TaskTypeId {
	const type = getTaskType(Number(value));
	if (!type) {
		throw new Error(`Invalid type ID: ${value}`);
	}
	return type.id;
}

export function createTaskUpdateRequest(
	updates: Partial<Task>,
	existingTask: Task,
): TaskUpdateRequest {
	return {
		title: updates.title,
		description: updates.description,
		status_id: updates.status_id,
		priority_id: updates.priority_id,
		type: updates.type?.code,
		dependencies:
			updates.relationships?.dependencies ??
			existingTask.relationships.dependencies,
		content: updates.content
			? {
					description: updates.content.description,
					acceptance_criteria: updates.content.acceptance_criteria?.map(
						(ac) => ({
							id: ac.id,
							description: ac.description,
							completed: ac.completed,
							order: ac.order,
						}),
					),
					implementation_details: updates.content.implementation_details,
					notes: updates.content.notes,
					attachments: updates.content.attachments,
					due_date: updates.content.due_date,
					assignee: updates.content.assignee,
				}
			: undefined,
		labels: updates.relationships?.labels,
		parent: updates.relationships?.parent,
	};
}

export function convertArrayToStrings(values: (string | number)[]): string[] {
	return values.map(String);
}

// Type assertion helpers
export function assertIsTask(value: unknown): asserts value is Task {
	if (!value || typeof value !== "object") {
		throw new Error("Value is not a Task");
	}
	// Add more specific checks if needed
}

export function assertIsTaskArray(value: unknown): asserts value is Task[] {
	if (!Array.isArray(value)) {
		throw new Error("Value is not a Task array");
	}

	// Validate each item in the array is a Task
	for (const item of value) {
		if (!item || typeof item !== "object") {
			throw new Error("Array contains non-object items");
		}

		const task = item as Partial<Task>;

		// Check required Task properties
		if (typeof task.id !== "string") {
			throw new Error("Task missing id or invalid type");
		}
		if (typeof task.title !== "string") {
			throw new Error("Task missing title or invalid type");
		}
		if (typeof task.description !== "string") {
			throw new Error("Task missing description or invalid type");
		}
		if (
			typeof task.status_id !== "number" &&
			typeof task.status_id !== "string"
		) {
			throw new Error("Task missing status_id or invalid type");
		}
		if (
			typeof task.priority_id !== "number" &&
			typeof task.priority_id !== "string"
		) {
			throw new Error("Task missing priority_id or invalid type");
		}
		if (typeof task.type_id !== "number" && typeof task.type_id !== "string") {
			throw new Error("Task missing type_id or invalid type");
		}
		if (typeof task.order !== "number") {
			throw new Error("Task missing order or invalid type");
		}

		// Check content
		if (!task.content || typeof task.content !== "object") {
			throw new Error("Task missing content or invalid type");
		}

		// Check relationships
		if (!task.relationships || typeof task.relationships !== "object") {
			throw new Error("Task missing relationships or invalid type");
		}

		// Check metadata
		if (!task.metadata || typeof task.metadata !== "object") {
			throw new Error("Task missing metadata or invalid type");
		}
	}
}

export function assertIsTaskStatus(
	value: unknown,
): asserts value is TaskStatus {
	if (!value || typeof value !== "string") {
		throw new Error("Value is not a TaskStatus");
	}
	if (!isValidStatusCode(value)) {
		throw new Error("Invalid TaskStatus value");
	}
}

export function assertIsTaskStatusArray(
	value: unknown,
): asserts value is TaskStatus[] {
	if (!Array.isArray(value)) {
		throw new Error("Value is not a TaskStatus array");
	}
	value.forEach((item, index) => {
		try {
			assertIsTaskStatus(item);
		} catch (err) {
			const error = err as Error;
			throw new Error(`Invalid TaskStatus at index ${index}: ${error.message}`);
		}
	});
}

export function generateMockTask(): Task {
	return {
		id: "mock-task-id",
		external_id: "mock-external-id",
		title: "Mock Task",
		description: "This is a mock task",
		status_id: DEFAULTS.STATUS.id,
		priority_id: DEFAULTS.PRIORITY.id,
		type_id: DEFAULTS.TYPE.id,
		order: 1,
		content: {
			description: "This is a mock task",
			acceptance_criteria: [],
			implementation_details: "",
			notes: "",
			attachments: [],
			due_date: "",
			assignee: "",
		},
		relationships: {
			parent: undefined,
			dependencies: [],
			labels: [],
		},
		metadata: {
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			board: undefined,
			column: undefined,
		},
		progress: {
			acceptance_criteria: {
				total: 0,
				completed: 0,
			},
			percentage: 0,
		},
		status_history: [],
	};
}
