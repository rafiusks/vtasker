import type { Task, AcceptanceCriterion } from "../types.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";

const TASKS_DIR = join(Deno.cwd(), ".vtask", "tasks");

// Ensure tasks directory exists
await ensureDir(TASKS_DIR);

export function parseMarkdown(content: string): Task {
	// First, normalize section boundaries and clean up any malformed content
	const normalizedContent = content
		// Ensure section headers start on a new line
		.replace(/([^\n])##\s/g, "$1\n## ")
		// Remove any empty lines between sections
		.replace(/\n{3,}/g, "\n\n")
		// Clean up any malformed content at the end (lines that start with a dash but don't have a checkbox)
		.replace(/\n-\s+(?![\[\]x ])[^\n]+$/g, "")
		// Remove any % characters at the end
		.replace(/\s*%+\s*$/, "")
		// Fix line breaks in IDs
		.replace(/\{id: ([^\n}]*)\n([^}]*)\}/g, "{id: $1$2}")
		// Clean up malformed metadata in acceptance criteria
		.replace(/\*\*[^*\n]+\*\*:[^\n]+(?=\s*{id:)/g, "")
		// Clean up any remaining metadata in acceptance criteria
		.replace(/\*\*[^*\n]+\*\*:[^\n]+(?=\s*$)/g, "")
		// Remove duplicate acceptance criteria lines
		.replace(/^(- \[[ x]\] [^\n]+)\n\1/gm, "$1");

	const lines = normalizedContent.split("\n");
	const taskIdMatch = content.match(/^# \[([^\]]+)\]/);
	const taskId = taskIdMatch ? taskIdMatch[1] : crypto.randomUUID();

	const task: Task = {
		id: taskId,
		title: "",
		description: "",
		status: "backlog",
		priority: "normal",
		type: "feature",
		labels: [],
		dependencies: [],
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		order: 0,
		content: {
			description: "",
			acceptance_criteria: [],
			attachments: [],
		},
		status_history: [],
	};

	let currentSection = "";
	let currentContent: string[] = [];

	const processAcceptanceCriteria = (lines: string[]) => {
		const now = new Date().toISOString();
		console.log("Processing acceptance criteria lines:", lines);

		// First, deduplicate lines based on their ID
		const seenIds = new Set<string>();
		const uniqueLines = lines.filter((line) => {
			if (typeof line !== "string") {
				console.warn("Non-string line found:", line);
				return false;
			}

			// Clean up the line and extract ID
			const cleanLine = line.trim();
			const idMatch = cleanLine.match(/{id: ([^}]+)}/);
			if (!idMatch) {
				// If no ID found, include the line (will generate new ID)
				return true;
			}
			const id = idMatch[1];
			if (seenIds.has(id)) return false;
			seenIds.add(id);
			return true;
		});

		return uniqueLines
			.map((line) => {
				const cleanLine = line.trim();
				console.log("Processing line:", cleanLine);

				// Extract ID
				const idMatch = cleanLine.match(/{id: ([^}]+)}/);
				const id = idMatch ? idMatch[1] : crypto.randomUUID();
				console.log("Extracted ID:", id);

				// Extract description and checkbox state
				let desc = cleanLine;
				let isCompleted = false;

				// Handle checkbox format: "[ ] Description {id: xxx}"
				const checkboxMatch = cleanLine.match(/^\[([x ])\]/i);
				if (checkboxMatch) {
					isCompleted = checkboxMatch[1].toLowerCase() === "x";
					desc = cleanLine.replace(/^\[[x ]\]\s*/, "");
				} else {
					// If no checkbox found, look for it in the middle of the string
					const midCheckboxMatch = cleanLine.match(/\[([x ])\]/i);
					if (midCheckboxMatch) {
						isCompleted = midCheckboxMatch[1].toLowerCase() === "x";
						desc = cleanLine.replace(/\[[x ]\]\s*/, "");
					}
				}

				// Remove the ID part
				desc = desc.replace(/\s*{id: [^}]+}/, "");

				// Clean up any remaining whitespace, duplicate dashes, and malformed metadata
				desc = desc
					.replace(/^-\s+/, "")
					.replace(/\*\*[^*\n]+\*\*:[^{]+/, "")
					.replace(/\*\*[^*]+\*\*:[^{]+/, "") // Remove any metadata that got mixed in
					.trim();

				console.log("Final description:", desc);
				console.log("Is completed:", isCompleted);

				if (!desc) {
					console.warn("Empty description found for criterion:", id);
					return null;
				}

				const criterion: AcceptanceCriterion = {
					id,
					description: desc,
					completed: isCompleted,
					completed_at: isCompleted ? now : null,
					completed_by: isCompleted ? "user" : null,
					created_at: now,
					updated_at: now,
					order: task.content.acceptance_criteria.length,
				};

				console.log("Created criterion:", criterion);
				return criterion;
			})
			.filter(
				(criterion): criterion is AcceptanceCriterion =>
					criterion !== null && criterion.description.trim() !== "",
			);
	};

	// Extract description first (everything between title and first section or metadata)
	let descriptionLines: string[] = [];
	let i = 0;
	// Skip title
	while (
		i < lines.length &&
		!lines[i].startsWith("##") &&
		!lines[i].startsWith("**")
	) {
		if (!lines[i].startsWith("#")) {
			const line = lines[i].trim();
			if (line) {
				descriptionLines.push(line);
			}
		}
		i++;
	}
	task.description = descriptionLines.join("\n").trim();
	task.content.description = task.description;

	// Process remaining sections
	for (; i < lines.length; i++) {
		const line = lines[i];
		// Handle title
		if (line.startsWith("# ")) {
			task.title = line.slice(2).trim();
			if (taskIdMatch) {
				task.title = task.title.replace(/^\[.*?\]\s*/, "");
			}
			continue;
		}

		// Handle metadata
		if (line.startsWith("**Status**:")) {
			const status = line.split(":")[1].trim();
			if (
				status === "backlog" ||
				status === "in-progress" ||
				status === "review" ||
				status === "done"
			) {
				task.status = status;
			}
			continue;
		}

		if (line.startsWith("**Priority**:")) {
			const priority = line.split(":")[1].trim();
			if (priority === "low" || priority === "normal" || priority === "high") {
				task.priority = priority;
			}
			continue;
		}

		if (line.startsWith("**Type**:")) {
			const type = line.split(":")[1].trim();
			if (
				type === "feature" ||
				type === "bug" ||
				type === "docs" ||
				type === "chore"
			) {
				task.type = type;
			}
			continue;
		}

		if (line.startsWith("**Labels**:")) {
			task.labels = line
				.split(":")[1]
				.trim()
				.split(",")
				.map((l) => l.trim())
				.filter(Boolean);
			continue;
		}

		if (line.startsWith("**Dependencies**:")) {
			task.dependencies = line
				.split(":")[1]
				.trim()
				.split(",")
				.map((d) => d.trim())
				.filter(Boolean);
			continue;
		}

		// Handle sections
		if (line.startsWith("## ")) {
			// Process previous section
			if (
				currentSection === "Acceptance Criteria" &&
				currentContent.length > 0
			) {
				console.log(
					"Found acceptance criteria section with content:",
					currentContent,
				);
				// Convert any string criteria to proper objects
				const contentToProcess = currentContent.map((line) => {
					if (typeof line === "string") {
						return line;
					}
					// If it's already an object, convert it back to string format
					if (typeof line === "object" && line !== null) {
						const criterion = line as AcceptanceCriterion;
						return `- [${criterion.completed ? "x" : " "}] ${criterion.description} {id: ${criterion.id}}`;
					}
					return String(line);
				});
				const criteria = processAcceptanceCriteria(contentToProcess);
				console.log("Processed criteria:", criteria);
				task.content.acceptance_criteria = criteria;
			} else if (currentSection === "Implementation Details") {
				task.content.implementation_details = currentContent.join("\n").trim();
			} else if (currentSection === "Notes") {
				task.content.notes = currentContent
					.filter((l) => !l.startsWith("- ["))
					.join("\n")
					.trim();
			}

			currentSection = line.slice(3).trim();
			currentContent = [];
			continue;
		}

		// Only add non-empty lines to current content
		const trimmedLine = line.trim();
		if (trimmedLine) {
			currentContent.push(trimmedLine);
		}
	}

	// Process the last section
	if (currentSection === "Acceptance Criteria" && currentContent.length > 0) {
		console.log(
			"Processing final acceptance criteria section:",
			currentContent,
		);
		// Convert any string criteria to proper objects
		const contentToProcess = currentContent.map((line) => {
			if (typeof line === "string") {
				return line;
			}
			// If it's already an object, convert it back to string format
			if (typeof line === "object" && line !== null) {
				const criterion = line as AcceptanceCriterion;
				return `- [${criterion.completed ? "x" : " "}] ${criterion.description} {id: ${criterion.id}}`;
			}
			return String(line);
		});
		const criteria = processAcceptanceCriteria(contentToProcess);
		console.log("Final processed criteria:", criteria);
		if (criteria.length > 0) {
			task.content.acceptance_criteria = criteria;
		}
	} else if (currentSection === "Implementation Details") {
		task.content.implementation_details = currentContent.join("\n").trim();
	} else if (currentSection === "Notes") {
		task.content.notes = currentContent
			.filter((l) => !l.startsWith("- ["))
			.join("\n")
			.trim();
	}

	console.log("Final task:", JSON.stringify(task, null, 2));
	return task;
}

export function generateMarkdown(task: Task): string {
	const lines: string[] = [
		`# [${task.id}] ${task.title}`,
		"",
		task.description,
		"",
		`**Status**: ${task.status}`,
		`**Priority**: ${task.priority}`,
		`**Type**: ${task.type}`,
		`**Labels**: ${task.labels.join(", ")}`,
		`**Dependencies**: ${task.dependencies.join(", ")}`,
		"",
	];

	// Add acceptance criteria section if there are any
	if (Array.isArray(task.content.acceptance_criteria)) {
		lines.push("## Acceptance Criteria");
		for (const criterion of task.content.acceptance_criteria) {
			console.log("Processing criterion for markdown:", criterion);

			// Handle both string and object formats
			if (typeof criterion === "string") {
				// If it's already in the right format, use it as is
				if (criterion.match(/^-\s*\[[ x]\].*{id: [\w-]+}$/)) {
					lines.push(criterion);
					continue;
				}
				// Otherwise, try to parse it
				const checkboxMatch = criterion.match(/\[([x ])\]/i);
				const idMatch = criterion.match(/{id: ([^}]+)}/);
				const completed = checkboxMatch
					? checkboxMatch[1].toLowerCase() === "x"
					: false;
				const id = idMatch ? idMatch[1] : crypto.randomUUID();
				const description = criterion
					.replace(/\[([x ])\]/i, "")
					.replace(/{id: [^}]+}/, "")
					.trim();
				lines.push(`- [${completed ? "x" : " "}] ${description} {id: ${id}}`);
				continue;
			}

			// Handle object format
			if (
				criterion &&
				typeof criterion === "object" &&
				!Array.isArray(criterion)
			) {
				const description = criterion.description?.trim() || "";
				const id = criterion.id || crypto.randomUUID();
				const completed = !!criterion.completed;

				if (!description) {
					console.warn("Empty description found for criterion:", id);
					continue;
				}

				lines.push(`- [${completed ? "x" : " "}] ${description} {id: ${id}}`);
			}
		}
		lines.push("");
	}

	// Add implementation details section if present
	if (task.content.implementation_details) {
		lines.push("## Implementation Details");
		lines.push(task.content.implementation_details);
		lines.push("");
	}

	// Add notes section if present
	if (task.content.notes) {
		lines.push("## Notes");
		lines.push(task.content.notes);
		lines.push("");
	}

	return lines.join("\n");
}

export async function getTask(id: string): Promise<Task | null> {
	try {
		const filePath = join(TASKS_DIR, `${id}.md`);
		const content = await Deno.readTextFile(filePath);
		return parseMarkdown(content);
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) {
			return null;
		}
		throw error;
	}
}

export async function saveTask(task: Task): Promise<void> {
	const filePath = join(TASKS_DIR, `${task.id}.md`);
	const content = generateMarkdown(task);
	await Deno.writeTextFile(filePath, content);
}

export async function listTasks(): Promise<Task[]> {
	const tasks: Task[] = [];
	for await (const entry of Deno.readDir(TASKS_DIR)) {
		if (entry.isFile && entry.name.endsWith(".md")) {
			const task = await getTask(entry.name.replace(/\.md$/, ""));
			if (task) {
				tasks.push(task);
			}
		}
	}
	return tasks;
}

export async function deleteTask(id: string): Promise<void> {
	try {
		const filePath = join(TASKS_DIR, `${id}.md`);
		await Deno.remove(filePath);
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) {
			return;
		}
		throw error;
	}
}
