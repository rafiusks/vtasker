import { join } from "std/path/mod.ts";
import type {
	StorageAdapter,
	Task,
	Board,
	TaskQuery,
	BoardQuery,
} from "../types/index.ts";
import { markdownToTask, taskToMarkdown } from "../converters/markdown.ts";
import { yamlToBoard, boardToYaml } from "../converters/yaml.ts";

export class FileSystemAdapter implements StorageAdapter {
	private tasksDir: string;
	private boardsDir: string;

	constructor(baseDir: string) {
		this.tasksDir = join(baseDir, "tasks");
		this.boardsDir = join(baseDir, "boards");
		this.ensureDirectories();
	}

	private async ensureDirectories() {
		try {
			await Deno.mkdir(this.tasksDir, { recursive: true });
			await Deno.mkdir(this.boardsDir, { recursive: true });
		} catch (error) {
			if (!(error instanceof Deno.errors.AlreadyExists)) {
				throw error;
			}
		}
	}

	async readTask(id: string): Promise<Task> {
		const filePath = join(this.tasksDir, `${id}.md`);
		const content = await Deno.readTextFile(filePath);
		return markdownToTask(content, id);
	}

	async writeTask(id: string, task: Task): Promise<void> {
		const filePath = join(this.tasksDir, `${id}.md`);

		// Calculate metrics before saving
		const criteria = task.content.acceptance_criteria || [];
		task.metrics = {
			acceptance_criteria: {
				total: criteria.length,
				completed: criteria.filter((c) => c.completed).length,
			},
		};

		const content = this.serializeTask(task);
		await Deno.writeTextFile(filePath, content);
	}

	async readBoard(id: string): Promise<Board> {
		const filePath = join(this.boardsDir, `${id}.yaml`);
		const content = await Deno.readTextFile(filePath);
		return yamlToBoard(content);
	}

	async writeBoard(id: string, board: Board): Promise<void> {
		const filePath = join(this.boardsDir, `${id}.yaml`);
		const content = boardToYaml(board);
		await Deno.writeTextFile(filePath, content);
	}

	async listTasks(query?: TaskQuery): Promise<Task[]> {
		try {
			const entries: Deno.DirEntry[] = [];
			for await (const entry of Deno.readDir(this.tasksDir)) {
				if (entry.isFile && entry.name.endsWith(".md")) {
					entries.push(entry);
				}
			}

			const tasks = await Promise.all(
				entries.map(async (entry) => {
					try {
						const id = entry.name.replace(/\.md$/, "");
						const content = await Deno.readTextFile(
							join(this.tasksDir, entry.name),
						);
						return markdownToTask(content, id);
					} catch (error) {
						console.error(`Error reading task ${entry.name}:`, error);
						return null;
					}
				}),
			);

			const validTasks = tasks.filter((task): task is Task => task !== null);

			if (!query) return validTasks;

			return validTasks.filter((task) => {
				for (const [key, value] of Object.entries(query)) {
					if (value === undefined) continue;

					if (Array.isArray(value)) {
						if (
							key === "labels" &&
							!value.every((v) => task.labels.includes(v))
						) {
							return false;
						}
					} else if (task[key as keyof Task] !== value) {
						return false;
					}
				}
				return true;
			});
		} catch (error) {
			console.error("Error listing tasks:", error);
			return [];
		}
	}

	async listBoards(query?: BoardQuery): Promise<Board[]> {
		const entries: Deno.DirEntry[] = [];
		for await (const entry of Deno.readDir(this.boardsDir)) {
			entries.push(entry);
		}

		const boards = await Promise.all(
			entries
				.filter(
					(entry): entry is Deno.DirEntry & { name: string } =>
						entry.isFile && entry.name.endsWith(".yaml"),
				)
				.map(async (entry) => {
					const content = await Deno.readTextFile(
						join(this.boardsDir, entry.name),
					);
					return yamlToBoard(content);
				}),
		);

		if (!query) return boards;

		return boards.filter((board: Board) => {
			for (const [key, value] of Object.entries(query)) {
				if (value === undefined) continue;
				if (board[key as keyof Board] !== value) {
					return false;
				}
			}
			return true;
		});
	}

	async deleteTask(id: string): Promise<void> {
		const filePath = join(this.tasksDir, `${id}.md`);
		await Deno.remove(filePath);
	}

	async deleteBoard(id: string): Promise<void> {
		const filePath = join(this.boardsDir, `${id}.yaml`);
		await Deno.remove(filePath);
	}

	private serializeTask(task: Task): string {
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

	private parseTask(id: string, content: string): Task {
		// ... existing parsing code ...
		const acceptanceCriteriaMatch = content.match(
			/## Acceptance Criteria\n([\s\S]*?)(?=\n## |$)/,
		);
		if (acceptanceCriteriaMatch) {
			const criteriaLines = acceptanceCriteriaMatch[1].trim().split("\n");
			task.content.acceptance_criteria = criteriaLines
				.filter((line) => line.trim())
				.map((line) => {
					// Parse markdown checkbox format: "- [x] Description {id: uuid}"
					const match = line.match(/^- \[(x| )\] (.*?) \{id: ([^}]+)\}$/);
					if (match) {
						const [, completed, description, id] = match;
						const now = new Date().toISOString();
						return {
							id,
							description,
							completed: completed === "x",
							completed_at: completed === "x" ? now : null,
							completed_by: completed === "x" ? "user" : null,
							created_at: now,
							updated_at: now,
							order: task.content.acceptance_criteria.length,
						};
					}
					return null;
				})
				.filter((c): c is AcceptanceCriterion => c !== null);
		}
		// ... rest of parsing code ...
	}
}
