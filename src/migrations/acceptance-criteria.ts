import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface Task {
	content: {
		acceptance_criteria: string[];
	};
}

interface NewAcceptanceCriterion {
	id: string;
	description: string;
	completed: boolean;
	completed_at: string | null;
	completed_by: string | null;
	created_at: string;
	updated_at: string;
	order: number;
	category?: string;
	notes?: string;
}

function parseMarkdown(content: string): Task {
	const lines = content.split("\n");
	const task: Task = { content: { acceptance_criteria: [] } };

	let inAcceptanceCriteria = false;
	const seenIds = new Set<string>();

	for (const line of lines) {
		if (line.startsWith("## Acceptance Criteria")) {
			inAcceptanceCriteria = true;
			continue;
		}
		if (line.startsWith("## ")) {
			inAcceptanceCriteria = false;
			continue;
		}

		if (inAcceptanceCriteria && line.trim()) {
			// Only process lines that start with a checkbox pattern
			if (line.trim().match(/^- \[[ x]\]/)) {
				const cleanLine = line.trim();
				// Extract existing ID if present
				const idMatch = cleanLine.match(/{id: ([^}]+)}/);
				let id = idMatch ? idMatch[1] : crypto.randomUUID();

				// Ensure ID is unique
				while (seenIds.has(id)) {
					id = crypto.randomUUID();
				}
				seenIds.add(id);

				// Extract description and clean it up
				const desc = cleanLine
					.replace(/{id: [^}]+}/, "") // Remove ID
					.replace(/^- \[[ x]\]/, "") // Remove checkbox
					.replace(/- \[[ x]\]/g, "") // Remove any duplicate checkboxes
					.trim();

				// Only add if we have a valid description
				if (desc) {
					const isCompleted = cleanLine.includes("[x]");
					task.content.acceptance_criteria.push(
						`- [${isCompleted ? "x" : " "}] ${desc} {id: ${id}}`,
					);
				}
			}
		}
	}

	return task;
}

function generateMarkdown(task: Task): string {
	if (!task.content.acceptance_criteria.length) {
		return "";
	}

	return `## Acceptance Criteria\n${task.content.acceptance_criteria.join("\n")}\n`;
}

async function migrateAcceptanceCriteria() {
	const tasksDir = join(process.cwd(), ".vtask", "tasks");
	const files = await readdir(tasksDir);

	for (const file of files) {
		if (!file.endsWith(".md")) continue;

		const filePath = join(tasksDir, file);
		const content = await readFile(filePath, "utf-8");

		try {
			const task = parseMarkdown(content);

			if (task.content?.acceptance_criteria?.length > 0) {
				const now = new Date().toISOString();

				// Convert old format to new format
				const newCriteria = task.content.acceptance_criteria.map(
					(criterion, index) => {
						// Extract existing ID if present
						const idMatch = criterion.match(/{id: ([^}]+)}/);
						const id = idMatch ? idMatch[1] : crypto.randomUUID();

						// Clean up the description
						const desc = criterion
							.replace(/{id: [^}]+}/, "") // Remove ID
							.replace(/^- \[[ x]\]/, "") // Remove checkbox
							.trim();

						const isCompleted = criterion.includes("[x]");

						return {
							id,
							description: desc,
							completed: isCompleted,
							completed_at: isCompleted ? now : null,
							completed_by: null,
							created_at: now,
							updated_at: now,
							order: index,
						} as NewAcceptanceCriterion;
					},
				);

				// Update the task with new criteria
				task.content.acceptance_criteria = newCriteria.map(
					(c) =>
						`- [${c.completed ? "x" : " "}] ${c.description} {id: ${c.id}}`,
				);

				// Generate new markdown content and replace the section
				const newContent = content.replace(
					/## Acceptance Criteria\n(?:.*\n)*?(?=##|$)/,
					`${generateMarkdown(task)}`,
				);

				// Write back to file
				await writeFile(filePath, newContent);
				console.log(`Updated acceptance criteria for ${file}`);
			}
		} catch (error) {
			console.error(`Error processing ${file}:`, error);
		}
	}
}

// Run the migration
migrateAcceptanceCriteria().catch(console.error);
