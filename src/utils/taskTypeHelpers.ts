import type { TaskTypeEntity } from "../types/typeReference";

export function formatTaskTypeForApi(type: TaskTypeEntity | undefined | null): {
	id: number;
} {
	if (!type || typeof type !== "object") {
		return { id: 1 }; // Default to feature type
	}
	return { id: type.id };
}

export function getTaskTypeId(type: TaskTypeEntity | undefined | null): number {
	if (!type || typeof type !== "object") {
		return 1; // Default to feature type
	}
	return type.id;
}

export function getTaskTypeCode(type: TaskTypeEntity | undefined | null): string {
	if (!type || typeof type !== "object") {
		return "feature"; // Default to feature type
	}
	return type.code;
}
