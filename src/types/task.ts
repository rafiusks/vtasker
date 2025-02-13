import type { TaskStatus } from "./index";

// Default task statuses
export const DEFAULT_TASK_STATUSES: TaskStatus[] = [
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
