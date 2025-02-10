import type { TaskStatus } from "../types";

const statusOrder: TaskStatus[] = [
	{
		id: "1",
		code: "backlog",
		name: "Backlog",
		label: "Backlog",
		description: "Tasks that are not yet started",
		display_order: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: "2",
		code: "in-progress",
		name: "In Progress",
		label: "In Progress",
		description: "Tasks that are currently being worked on",
		display_order: 2,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: "3",
		code: "review",
		name: "Review",
		label: "Review",
		description: "Tasks that are ready for review",
		display_order: 3,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: "4",
		code: "done",
		name: "Done",
		label: "Done",
		description: "Tasks that are completed",
		display_order: 4,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
];

export function isValidStatusTransition(
	fromStatus: TaskStatus,
	toStatus: TaskStatus,
): boolean {
	const fromIndex = statusOrder.findIndex((s) => s.code === fromStatus.code);
	const toIndex = statusOrder.findIndex((s) => s.code === toStatus.code);

	if (fromIndex === -1 || toIndex === -1) {
		return false;
	}

	// Allow moving forward one step at a time or moving backward to any previous status
	return toIndex === fromIndex + 1 || toIndex < fromIndex;
}

export function getNextStatus(
	currentStatus: TaskStatus,
): TaskStatus | undefined {
	const currentIndex = statusOrder.findIndex(
		(s) => s.code === currentStatus.code,
	);
	if (currentIndex === -1 || currentIndex === statusOrder.length - 1) {
		return undefined;
	}
	return statusOrder[currentIndex + 1];
}

export function getPreviousStatus(
	currentStatus: TaskStatus,
): TaskStatus | undefined {
	const currentIndex = statusOrder.findIndex(
		(s) => s.code === currentStatus.code,
	);
	if (currentIndex <= 0) {
		return undefined;
	}
	return statusOrder[currentIndex - 1];
}

export function getStatusByCode(code: string): TaskStatus | undefined {
	return statusOrder.find((s) => s.code === code);
}

export function getAllStatuses(): TaskStatus[] {
	return [...statusOrder];
}
