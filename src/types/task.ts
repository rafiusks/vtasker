import type { TaskStatus } from "./index";

// Default task statuses
export const DEFAULT_TASK_STATUSES: TaskStatus[] = [
	{
		id: 1,
		code: "todo",
		name: "To Do",
		color: "bg-gray-100",
		display_order: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 2,
		code: "in_progress",
		name: "In Progress",
		color: "bg-blue-100",
		display_order: 2,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 3,
		code: "in_review",
		name: "In Review",
		color: "bg-yellow-100",
		display_order: 3,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 4,
		code: "done",
		name: "Done",
		color: "bg-green-100",
		display_order: 4,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
];
