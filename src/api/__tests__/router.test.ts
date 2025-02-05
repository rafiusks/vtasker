import { test, expect } from '@playwright/test';
import type { Task } from "../../types";

test.describe("Task API", () => {
	const testTask: Partial<Task> = {
		title: "Test Task",
		description: "Test Description",
		status_id: 1,
		priority_id: 1,
		type_id: 1,
		order: 0,
		content: {
			description: "Test Description",
			acceptance_criteria: [],
			implementation_details: null,
			notes: null,
			attachments: [],
			due_date: null,
			assignee: null,
		},
		relationships: {
			parent: null,
			dependencies: [],
			labels: [],
		},
		metadata: {
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			board: null,
			column: null,
		},
		progress: {
			acceptance_criteria: {
				total: 0,
				completed: 0,
			},
			percentage: 0,
		}
	};

	test("should update task metadata correctly", async () => {
		const createResponse = await fetch("http://localhost:8000/api/tasks", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(testTask),
		});

		expect(createResponse.ok).toBe(true);
		const createdTask = await createResponse.json();
		console.log("Created task:", createdTask);

		const updateData = {
			...testTask,
			content: {
				...testTask.content,
				notes: "Updated Test Notes",
			},
		} as Task;

		const updateResponse = await fetch(
			`http://localhost:8000/api/tasks/${createdTask.id}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			},
		);

		expect(updateResponse.ok).toBe(true);
		const updatedTask = await updateResponse.json();
		console.log("Updated task:", updatedTask);

		expect(updatedTask.content?.notes).toBe("Updated Test Notes");
		expect(updatedTask.content?.due_date).toBe(testTask.content?.due_date);
		expect(updatedTask.content?.assignee).toBe(testTask.content?.assignee);

		const fetchResponse = await fetch(
			`http://localhost:8000/api/tasks/${createdTask.id}`,
		);
		expect(fetchResponse.ok).toBe(true);
		const fetchedTask = await fetchResponse.json();
		console.log("Fetched task:", fetchedTask);

		expect(fetchedTask.content?.notes).toBe("Updated Test Notes");
		expect(fetchedTask.content?.due_date).toBe(testTask.content?.due_date);
		expect(fetchedTask.content?.assignee).toBe(testTask.content?.assignee);

		// Clean up - delete the task
		const deleteResponse = await fetch(
			`http://localhost:8000/api/tasks/${createdTask.id}`,
			{
				method: "DELETE",
			},
		);
		expect(deleteResponse.ok).toBe(true);
	});
});
