import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { parseMarkdown, generateMarkdown } from "./tasks.ts";
import type { Task } from "../types.ts";

Deno.test("Task Storage", async (t) => {
	await t.step(
		"parseMarkdown should correctly parse acceptance criteria with descriptions",
		() => {
			const markdown = `# [TASK-123] Test Task
This is a task description.

## Acceptance Criteria
- [ ] First criterion with description
- [ ] Second criterion with a longer description
- [x] Third criterion that is completed`;

			const result = parseMarkdown(markdown);
			assertEquals(result.id, "TASK-123");
			assertEquals(result.content.description, "This is a task description.");
			assertEquals(result.content.acceptance_criteria.length, 3);
			assertEquals(
				result.content.acceptance_criteria[0].description,
				"First criterion with description",
			);
			assertEquals(
				result.content.acceptance_criteria[1].description,
				"Second criterion with a longer description",
			);
			assertEquals(
				result.content.acceptance_criteria[2].description,
				"Third criterion that is completed",
			);
			assertEquals(result.content.acceptance_criteria[2].completed, true);
		},
	);

	await t.step(
		"generateMarkdown should correctly format task with acceptance criteria",
		() => {
			const task: Task = {
				id: "TASK-123",
				title: "Test Task",
				description: "This is a task description.",
				status: "backlog",
				priority: "normal",
				type: "feature",
				labels: [],
				dependencies: [],
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				order: 0,
				content: {
					description: "This is a task description.",
					acceptance_criteria: [
						{
							id: "ac-1",
							description: "First criterion",
							completed: false,
							completed_at: null,
							completed_by: null,
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
							order: 0,
						},
						{
							id: "ac-2",
							description: "Second criterion",
							completed: true,
							completed_at: new Date().toISOString(),
							completed_by: null,
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
							order: 1,
						},
					],
					attachments: [],
				},
				status_history: [],
			};

			const result = generateMarkdown(task);
			const expected = `# Test Task

## Description
This is a task description.

**Status**: backlog
**Priority**: normal
**Type**: feature
**Labels**: 
**Dependencies**: 

## Acceptance Criteria
- [ ] First criterion {id: ac-1}
- [x] Second criterion {id: ac-2}
`;

			assertEquals(result.trim(), expected.trim());
		},
	);
});
