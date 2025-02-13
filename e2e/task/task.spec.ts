import { test, expect } from "@playwright/test";
import { loginTestUser, registerTestUser, waitForToast } from "../test-utils";
import type { TestUser } from "../test-utils";

test.describe("Task Management", () => {
	let testUser: TestUser;

	test.beforeEach(async ({ page }) => {
		// Register and login a test user before each test
		testUser = await registerTestUser(page);
		await loginTestUser(page, testUser);

		// Create a test board
		await page.goto("/boards");
		await page.getByTestId("create-board-button").click();
		await page.getByTestId("board-name-input").fill("Test Board");
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/boards") && response.status() === 201,
			),
			page.getByTestId("submit-create-board-button").click(),
		]);

		// Wait for navigation to the new board
		await page.waitForURL(/.*\/b\/.*/);
		await page.waitForLoadState("networkidle");

		// Listen to console logs
		page.on("console", (msg) => {
			console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
		});
	});

	test("should create a task with valid data", async ({ page }) => {
		// Click create task button
		await page.getByTestId("create-task-button").click();

		// Verify modal is open
		await expect(page.getByTestId("create-task-modal")).toBeVisible();

		// Fill in task details
		await page.getByTestId("task-title-input").fill("Test Task");
		await page.getByTestId("task-description-input").fill("Test Description");
		await page.getByTestId("task-type-select").selectOption("1"); // Feature
		await page.getByTestId("task-priority-select").selectOption("2"); // Medium
		await page.getByTestId("task-status-select").selectOption("1"); // Backlog

		// Create task and wait for response
		const [response] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 201,
			),
			page.getByTestId("submit-create-task-button").click(),
		]);

		// Verify task was created
		const task = await response.json();
		expect(task.title).toBe("Test Task");

		// Verify success message
		await waitForToast(page, "Task created successfully");

		// Verify task appears in the board
		await expect(page.getByText("Test Task")).toBeVisible();
	});

	test("should show validation errors for empty fields", async ({ page }) => {
		// Click create task button
		await page.getByTestId("create-task-button").click();

		// Try to submit without filling required fields
		await page.getByTestId("submit-create-task-button").click();

		// Verify validation messages
		await expect(page.getByText("Title is required")).toBeVisible();
	});

	test("should update task details", async ({ page }) => {
		// First create a task
		await page.getByTestId("create-task-button").click();
		await page.getByTestId("task-title-input").fill("Task to Update");
		await page.getByTestId("task-type-select").selectOption("1"); // Feature
		await page.getByTestId("task-priority-select").selectOption("2"); // Medium
		await page.getByTestId("task-status-select").selectOption("1"); // Backlog
		await page.getByTestId("submit-create-task-button").click();
		await waitForToast(page, "Task created successfully");

		// Click on the task to open details
		await page.getByText("Task to Update").click();

		// Update task details
		await page.getByTestId("task-title-input").fill("Updated Task");
		await page
			.getByTestId("task-description-input")
			.fill("Updated Description");

		// Wait for auto-save
		await waitForToast(page, "Changes saved");

		// Close task details
		await page.keyboard.press("Escape");

		// Verify changes are reflected
		await expect(page.getByText("Updated Task")).toBeVisible();
	});

	test("should delete a task", async ({ page }) => {
		// First create a task
		await page.getByTestId("create-task-button").click();
		await page.getByTestId("task-title-input").fill("Task to Delete");
		await page.getByTestId("task-type-select").selectOption("1"); // Feature
		await page.getByTestId("task-priority-select").selectOption("2"); // Medium
		await page.getByTestId("task-status-select").selectOption("1"); // Backlog
		await page.getByTestId("submit-create-task-button").click();
		await waitForToast(page, "Task created successfully");

		// Click on the task to open details
		await page.getByText("Task to Delete").click();

		// Click delete button
		await page.getByTestId("delete-task-button").click();

		// Confirm deletion
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 204,
			),
			page.getByTestId("confirm-delete-task-button").click(),
		]);

		// Verify success message
		await waitForToast(page, "Task deleted successfully");

		// Verify task is removed
		await expect(page.getByText("Task to Delete")).not.toBeVisible();
	});

	test("should change task status via drag and drop", async ({ page }) => {
		// Create a task
		await page.getByTestId("create-task-button").click();
		await page.getByTestId("task-title-input").fill("Task to Move");
		await page.getByTestId("task-type-select").selectOption("1"); // Feature
		await page.getByTestId("task-priority-select").selectOption("2"); // Medium
		await page.getByTestId("task-status-select").selectOption("1"); // Backlog
		await page.getByTestId("submit-create-task-button").click();
		await waitForToast(page, "Task created successfully");

		// Get task element
		const task = page.getByText("Task to Move");
		const targetColumn = page.getByTestId("status-column-in_progress");

		// Perform drag and drop
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 200,
			),
			task.dragTo(targetColumn),
		]);

		// Verify task is in new column
		await expect(
			targetColumn.getByRole("listitem").filter({ hasText: "Task to Move" }),
		).toBeVisible();
	});

	test("should change task status via dropdown", async ({ page }) => {
		// Create a task
		await page.getByTestId("create-task-button").click();
		await page.getByTestId("task-title-input").fill("Task to Change Status");
		await page.getByTestId("task-type-select").selectOption("1"); // Feature
		await page.getByTestId("task-priority-select").selectOption("2"); // Medium
		await page.getByTestId("task-status-select").selectOption("1"); // Backlog
		await page.getByTestId("submit-create-task-button").click();
		await waitForToast(page, "Task created successfully");

		// Click on the task to open details
		await page.getByText("Task to Change Status").click();

		// Change status
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 200,
			),
			page
				.getByTestId("task-status-select")
				.selectOption("2"), // In Progress
		]);

		// Wait for auto-save
		await waitForToast(page, "Changes saved");

		// Close task details
		await page.keyboard.press("Escape");

		// Verify task is in new column
		const inProgressColumn = page.getByTestId("status-column-in_progress");
		await expect(
			inProgressColumn
				.getByRole("listitem")
				.filter({ hasText: "Task to Change Status" }),
		).toBeVisible();
	});

	test("should handle validation errors when updating task", async ({
		page,
	}) => {
		// Create a task
		await page.getByTestId("create-task-button").click();
		await page.getByTestId("task-title-input").fill("Task to Test Validation");
		await page.getByTestId("task-type-select").selectOption("1"); // Feature
		await page.getByTestId("task-priority-select").selectOption("2"); // Medium
		await page.getByTestId("task-status-select").selectOption("1"); // Backlog
		await page.getByTestId("submit-create-task-button").click();
		await waitForToast(page, "Task created successfully");

		// Click on the task to open details
		await page.getByText("Task to Test Validation").click();

		// Try to clear title
		await page.getByTestId("task-title-input").fill("");

		// Verify error message
		await expect(page.getByText("Title is required")).toBeVisible();

		// Verify save button is disabled
		await expect(page.getByTestId("save-task-button")).toBeDisabled();
	});

	test("should handle network errors gracefully", async ({ page }) => {
		// Create a task
		await page.getByTestId("create-task-button").click();
		await page.getByTestId("task-title-input").fill("Task for Error Test");
		await page.getByTestId("task-type-select").selectOption("1"); // Feature
		await page.getByTestId("task-priority-select").selectOption("2"); // Medium
		await page.getByTestId("task-status-select").selectOption("1"); // Backlog
		await page.getByTestId("submit-create-task-button").click();
		await waitForToast(page, "Task created successfully");

		// Click on the task to open details
		await page.getByText("Task for Error Test").click();

		// Simulate offline mode
		await page.route("**/api/tasks/**", (route) => route.abort());

		// Try to update task
		await page.getByTestId("task-title-input").fill("Updated Title");

		// Verify error message
		await waitForToast(page, "Failed to save changes");

		// Restore network
		await page.unroute("**/api/tasks/**");
	});
});
