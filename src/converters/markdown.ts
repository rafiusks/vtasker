import type { Task, TaskContent } from "../types/index.ts";

/**
 * Converts a markdown string to a Task object
 */
export function markdownToTask(markdown: string, id: string): Task {
	if (!markdown.trim()) {
		throw new Error(`Task file is empty: ${id}`);
	}

	const lines = markdown.split("\n");
	const title = lines[0]
		.replace(/^#\s+/, "")
		.replace(/(\[task-\d{3}(-\d{1,2})?\]\s*)+/, "")
		.trim();

	if (!title) {
		throw new Error(`Task title is missing: ${id}`);
	}

	const content: TaskContent = {
		description: "",
		acceptance_criteria: [],
		implementation_details: "",
		notes: "",
		attachments: [],
		due_date: "",
		assignee: "",
	};

	let description = "";
	let status: Task["status"] = "backlog";
	let priority: Task["priority"] = "low";
	let type: Task["type"] = "feature";
	const labels: string[] = [];
	const dependencies: string[] = [];
	let parent = "";

	let currentSection = "";
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		if (line.startsWith("## ")) {
			currentSection = line.slice(3).toLowerCase();
			continue;
		}

		if (line.startsWith("**") && line.includes(":")) {
			const [key, value] = line
				.slice(2)
				.split("**: ")
				.map((s) => s.trim());
			switch (key.toLowerCase()) {
				case "status":
					if (isValidStatus(value)) {
						status = value;
					}
					break;
				case "priority":
					if (isValidPriority(value)) {
						priority = value;
					}
					break;
				case "type":
					if (isValidType(value)) {
						type = value;
					}
					break;
				case "labels":
					labels.push(
						...value
							.split(",")
							.map((l) => l.trim())
							.filter(Boolean),
					);
					break;
				case "dependencies":
					dependencies.push(
						...value
							.split(",")
							.map((d) => d.trim())
							.filter(Boolean),
					);
					break;
				case "parent":
					parent = value;
					break;
				case "due date":
					content.due_date = value;
					break;
				case "assignee":
					content.assignee = value;
					break;
			}
			continue;
		}

		switch (currentSection) {
			case "description":
				description += (description ? "\n" : "") + line;
				break;
			case "acceptance criteria":
				if (line.startsWith("- ")) {
					// Parse markdown checkbox format: "- [x] Description {id: uuid}"
					const match = line.match(/^- \[(x| )\] (.*?) \{id: ([^}]+)\}$/);
					if (match) {
						const [, completed, description, id] = match;
						const now = new Date().toISOString();
						content.acceptance_criteria.push({
							id,
							description,
							completed: completed === "x",
							completed_at: completed === "x" ? now : null,
							completed_by: completed === "x" ? "user" : null,
							created_at: now,
							updated_at: now,
							order: content.acceptance_criteria.length,
						});
					}
				}
				break;
			case "implementation details":
				content.implementation_details =
					(content.implementation_details || "") +
					(content.implementation_details ? "\n" : "") +
					line;
				break;
			case "notes":
				content.notes =
					(content.notes || "") + (content.notes ? "\n" : "") + line;
				break;
			case "attachments":
				if (line.startsWith("- ")) {
					content.attachments.push(line.slice(2).trim());
				}
				break;
			default:
				if (!currentSection && line) {
					description += (description ? "\n" : "") + line;
				}
		}
	}

	content.description = description;

	return {
		id,
		title,
		description,
		status,
		priority,
		type,
		labels,
		dependencies,
		parent: parent || undefined,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		order: 0,
		content,
		status_history: [],
		metrics: {
			acceptance_criteria: {
				total: content.acceptance_criteria.length,
				completed: content.acceptance_criteria.filter((c) => c.completed)
					.length,
			},
		},
	};
}

/**
 * Converts a Task object to a markdown string
 */
export function taskToMarkdown(task: Task): string {
	const lines = [
		`# [${task.id}] ${task.title}`,
		"## Description",
		task.description,
		`**Status**: ${task.status}`,
		`**Priority**: ${task.priority}`,
		`**Type**: ${task.type}`,
		`**Labels**: ${task.labels.join(", ")}`,
		`**Dependencies**: ${task.dependencies.join(", ")}`,
		"## Implementation Details",
		task.content.implementation_details || "",
		"## Acceptance Criteria",
		// Format acceptance criteria as markdown checkboxes
		...(task.content.acceptance_criteria || []).map(
			(criterion) =>
				`- [${criterion.completed ? "x" : " "}] ${criterion.description} {id: ${criterion.id}}`,
		),
		"## Notes",
		task.content.notes || "",
	];

	return lines.join("\n");
}

function isValidStatus(value: string): value is Task["status"] {
	return ["backlog", "in-progress", "review", "done"].includes(value);
}

function isValidPriority(value: string): value is Task["priority"] {
	return ["low", "normal", "high"].includes(value);
}

function isValidType(value: string): value is Task["type"] {
	return ["feature", "bug", "docs", "chore"].includes(value);
}
