import type { TaskType } from "../types/task";

export function formatTaskTypeForApi(type: TaskType | undefined | null): {
	id: number;
} {
	if (!type || typeof type !== "object") {
		return { id: 1 }; // Default to feature type
	}
	return { id: type.id };
}

export function getTaskTypeId(type: TaskType | undefined | null): number {
	if (!type || typeof type !== "object") {
		return 1; // Default to feature type
	}
	return type.id;
}

export function getTaskTypeCode(type: TaskType | undefined | null): string {
	if (!type || typeof type !== "object") {
		return "feature"; // Default to feature type
	}
	return type.code;
}
