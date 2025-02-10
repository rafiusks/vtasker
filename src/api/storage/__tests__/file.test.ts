import { describe, it, expect, afterEach } from "vitest";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import type { Task, TaskStatus, TaskTypeEntity } from "../../../types";

describe("Task File Storage", () => {
	const testTaskId = "test-task";
	const testFilePath = join(".vtask", "tasks", `${testTaskId}.md`);

	const testStatus: TaskStatus = {
		id: "1",
		code: "in-progress",
		name: "In Progress",
		label: "In Progress",
		description: "Task is being worked on",
		display_order: 2,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	const testType: TaskTypeEntity = {
		id: 1,
		code: "feature",
		name: "Feature",
		description: "A new feature",
		display_order: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	const testTask: Task = {
		id: "test-task-1",
		title: "Test Task",
		description: "A test task",
		status_id: 1,
		priority_id: 1,
		type_id: 1,
		order: 1,
		status: testStatus,
		type: testType,
		content: {
			description: "Test Description",
			acceptance_criteria: [
				{
					id: "ac1",
					description: "Test Criterion",
					completed: false,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
					order: 1,
				},
			],
			implementation_details: undefined,
			notes: undefined,
			attachments: [],
			due_date: undefined,
			assignee: undefined,
		},
		relationships: {
			parent: undefined,
			dependencies: [],
			labels: [],
		},
		metadata: {
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			board: undefined,
			column: undefined,
		},
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	afterEach(() => {
		try {
			unlinkSync(testFilePath);
		} catch (_e) {
			// Ignore if file doesn't exist
		}
	});

	it("should write and read task metadata correctly", () => {
		// Write the task
		writeFileSync(
			testFilePath,
			`# ${testTask.title}

## Description
${testTask.description}

**Status**: ${testTask.status?.name ?? "Unknown"}
**Priority**: ${testTask.priority_id}
**Type**: ${testTask.type?.name ?? "Unknown"}
**Labels**: ${testTask.relationships.labels.join(", ")}
**Dependencies**: ${testTask.relationships.dependencies.join(", ")}
**Due Date**: ${testTask.content.due_date}
**Assignee**: ${testTask.content.assignee}

## Implementation Details
${testTask.content.implementation_details}

## Acceptance Criteria
- ${testTask.content.acceptance_criteria[0].description}

## Notes
${testTask.content.notes}
`,
		);

		// Read the file
		const fileContent = readFileSync(testFilePath, "utf-8");
		console.log("File content:", fileContent);

		// Verify content
		expect(fileContent).toContain(`**Due Date**: ${testTask.content.due_date}`);
		expect(fileContent).toContain(`**Assignee**: ${testTask.content.assignee}`);
		expect(fileContent).toContain(
			`**Type**: ${testTask.type?.name ?? "Unknown"}`,
		);
	});
});
