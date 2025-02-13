import type { TaskStatus } from "../types";

export const VALID_STATUSES: TaskStatus[] = [
	{
		id: 1,
		code: "backlog",
		name: "Backlog",
		label: "Backlog",
		color: "#6B7280",
		display_order: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 2,
		code: "in-progress",
		name: "In Progress",
		label: "In Progress",
		color: "#3B82F6",
		display_order: 2,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 3,
		code: "review",
		name: "Review",
		label: "Review",
		color: "#F59E0B",
		display_order: 3,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 4,
		code: "done",
		name: "Done",
		label: "Done",
		color: "#10B981",
		display_order: 4,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
];

export function isValidStatus(status: TaskStatus): boolean {
	return VALID_STATUSES.some((validStatus) => validStatus.id === status.id);
}

export function getValidStatusById(id: number): TaskStatus | undefined {
	return VALID_STATUSES.find((status) => status.id === id);
}

export function getValidStatusByCode(code: string): TaskStatus | undefined {
	return VALID_STATUSES.find((status) => status.code === code);
}

export function isValidStatusTransition(
	fromStatus: TaskStatus,
	toStatus: TaskStatus,
): boolean {
	const fromIndex = VALID_STATUSES.findIndex((s) => s.code === fromStatus.code);
	const toIndex = VALID_STATUSES.findIndex((s) => s.code === toStatus.code);

	// Invalid status codes
	if (fromIndex === -1 || toIndex === -1) {
		return false;
	}

	// Can only move forward one step at a time
	return toIndex === fromIndex + 1;
}

export function getNextStatus(
	currentStatus: TaskStatus,
): TaskStatus | undefined {
	const currentIndex = VALID_STATUSES.findIndex(
		(s: TaskStatus) => s.code === currentStatus.code,
	);
	if (currentIndex === -1 || currentIndex === VALID_STATUSES.length - 1) {
		return undefined;
	}
	return VALID_STATUSES[currentIndex + 1];
}

export function getPreviousStatus(
	currentStatus: TaskStatus,
): TaskStatus | undefined {
	const currentIndex = VALID_STATUSES.findIndex(
		(s: TaskStatus) => s.code === currentStatus.code,
	);
	if (currentIndex <= 0) {
		return undefined;
	}
	return VALID_STATUSES[currentIndex - 1];
}

export function getStatusByCode(code: string): TaskStatus | undefined {
	return VALID_STATUSES.find((s: TaskStatus) => s.code === code);
}

export function getAllStatuses(): TaskStatus[] {
	return [...VALID_STATUSES];
}
