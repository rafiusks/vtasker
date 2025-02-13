import { test, expect } from "@playwright/test";
import {
	setupTestUserViaApi,
	createTestBoardViaApi,
	cleanupTestData,
	waitForToast,
	waitForElement,
	waitForModalToBeReady,
	waitForNetworkIdle,
	seedTaskOptionsViaApi,
} from "../test-utils";
import type { TestUser } from "../test-utils";

test.describe("Task Management", () => {
	let testUser: TestUser;
	let boardSlug: string;

	test.beforeEach(async ({ page }) => {
		try {
			// Clean up any existing test data first
			console.log("Running initial cleanup...");
			await cleanupTestData();
			console.log("Initial cleanup completed");

			// Setup test user via API
			console.log("Setting up test user...");
			testUser = await setupTestUserViaApi();
			console.log("Test user created:", testUser.email);

			if (!testUser.token) {
				throw new Error("Failed to get authentication token");
			}

			// Seed task options
			console.log("Seeding task options...");
			await seedTaskOptionsViaApi(testUser.token);
			console.log("Task options seeded successfully");

			// Create test board via API
			console.log("Creating test board...");
			const board = await createTestBoardViaApi(testUser.token);
			boardSlug = board.slug;
			console.log("Test board created:", boardSlug);

			// Set up authentication in the browser
			console.log("Setting up browser authentication...");
			await page.goto("/");
			await page.evaluate(
				({ token, user }) => {
					const authData = {
						token,
						refresh_token: token, // Using same token as refresh token for test purposes
						user,
						expiresAt: Date.now() + 3600 * 1000, // 1 hour from now
						refreshExpiresAt: Date.now() + 7200 * 1000, // 2 hours from now
					};
					localStorage.setItem("auth", JSON.stringify(authData));
				},
				{
					token: testUser.token,
					user: {
						id: "test-user",
						email: testUser.email,
						full_name: testUser.fullName,
					},
				},
			);

			// Navigate to board and wait for load
			console.log("Navigating to board:", boardSlug);
			await page.goto(`/b/${boardSlug}`);

			// Wait for critical resources
			console.log("Waiting for page load...");
			await page.waitForLoadState("domcontentloaded");
			await page.waitForLoadState("networkidle");

			// Check if we're on the right page
			console.log("Checking page URL...");
			await expect(page).toHaveURL(new RegExp(`/b/${boardSlug}$`));

			// Wait for board container
			console.log("Waiting for board container...");
			await expect(page.getByTestId("board-container")).toBeVisible({
				timeout: 30000,
			});

			// Check for error states
			const errorText = await page
				.getByText(/error/i)
				.first()
				.textContent()
				.catch(() => null);
			if (errorText) {
				console.error("Found error on page:", errorText);
				throw new Error(`Page error: ${errorText}`);
			}

			// Wait for create task button with increased timeout
			console.log("Waiting for create task button...");
			await expect(page.getByTestId("create-task-button")).toBeVisible({
				timeout: 30000,
			});

			console.log("Test setup completed successfully");
		} catch (error) {
			// Log the error and cleanup
			console.error("Test setup failed:", error);
			if (testUser?.token) {
				await cleanupTestData(testUser.token).catch((cleanupError) => {
					console.error(
						"Cleanup after setup failure also failed:",
						cleanupError,
					);
				});
			}
			throw error;
		}
	});

	test.afterEach(async () => {
		try {
			if (testUser?.token) {
				await cleanupTestData(testUser.token);
			}
		} catch (error) {
			console.warn("Failed to clean up test data:", error);
		}
	});

	test("should handle task creation with validation", async ({ page }) => {
		// Wait for board to load and open create task modal
		await waitForElement(page, "create-task-button");
		await page.getByTestId("create-task-button").click();
		await waitForModalToBeReady(page);

		// Try to submit the form without filling any fields
		await page.getByTestId("submit-create-task-button").click();

		// Wait for error message to appear
		await expect(
			page.getByRole("alert").filter({ hasText: "Title is required" }),
		).toBeVisible();

		// Check that the title input shows validation error
		const titleInput = page.getByTestId("task-title-input");
		await expect(titleInput).toHaveAttribute("required", "");
		await expect(titleInput).toHaveAttribute("aria-invalid", "true");

		// Check that the form is still open (not submitted)
		await expect(page.getByTestId("task-modal")).toBeVisible();

		// Fill in all task details
		await titleInput.fill("Test Task");
		await page.getByTestId("task-description-input").fill("Test Description");

		// Wait for form options to be loaded
		await waitForElement(page, "task-type-select");
		await waitForElement(page, "task-priority-select");
		await waitForElement(page, "task-status-select");

		// Select task options
		await page.getByTestId("task-type-select").selectOption("1"); // Feature
		await page.getByTestId("task-priority-select").selectOption("2"); // Medium
		await page.getByTestId("task-status-select").selectOption("1"); // Backlog

		// Submit the form and wait for the response
		const [createResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 201,
				{ timeout: 30000 },
			),
			page.getByTestId("submit-create-task-button").click(),
		]);

		// Verify task was created with correct data
		const task = await createResponse.json();
		expect(task.title).toBe("Test Task");
		expect(task.description).toBe("Test Description");

		// Wait for success message and verify task appears on board
		await waitForToast(page, "Task created successfully");
		await waitForElement(page, `task-card-${task.id}`);
		await expect(page.getByText("Test Task")).toBeVisible();

		// Modal should be closed after successful submission
		await expect(page.getByTestId("task-modal")).not.toBeVisible();
	});

	test("should update task details", async ({ page }) => {
		// First create a task
		await waitForElement(page, "create-task-button");
		await Promise.all([
			page.waitForLoadState("networkidle"),
			page.getByTestId("create-task-button").click(),
		]);

		// Wait for the modal to be opened
		await waitForElement(page, "create-task-modal");

		// Wait for task options to be loaded
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/task-statuses") &&
					response.status() === 200,
			),
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/task-priorities") &&
					response.status() === 200,
			),
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/task-types") &&
					response.status() === 200,
			),
		]).catch(() => {
			// If waiting for responses times out, just wait a bit and continue
			// The options might have been loaded before we started waiting
			return new Promise((resolve) => setTimeout(resolve, 1000));
		});

		// Wait for loading state to disappear or confirm form is ready
		const formLoading = page.getByTestId("task-form-loading");
		const taskForm = page.getByTestId("task-form");

		// Either wait for loading to disappear or form to be visible
		await Promise.race([
			expect(formLoading)
				.not.toBeVisible()
				.catch(() => {}),
			expect(taskForm).toBeVisible(),
		]);

		// Now wait for form elements
		await waitForElement(page, "task-title-input");
		await waitForElement(page, "task-type-select");
		await waitForElement(page, "task-priority-select");
		await waitForElement(page, "task-status-select");

		// Fill in task details
		await page.getByTestId("task-title-input").fill("Task to Update");
		await page.getByTestId("task-type-select").selectOption("1");
		await page.getByTestId("task-priority-select").selectOption("2");
		await page.getByTestId("task-status-select").selectOption("1");

		// Submit the form
		const [createResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 201,
			),
			page.getByTestId("submit-task-button").click(),
		]);

		// Get the created task data
		const task = await createResponse.json();
		await waitForToast(page, "Task created successfully");

		// Wait for task card using task ID
		await waitForElement(page, `task-card-${task.id}`);

		// Click on the task to open details
		await page.getByTestId(`task-card-${task.id}`).click();

		// Wait for modal to be opened again
		await waitForElement(page, "create-task-modal");

		// Wait for task options to be loaded again
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/task-statuses") &&
					response.status() === 200,
			),
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/task-priorities") &&
					response.status() === 200,
			),
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/task-types") &&
					response.status() === 200,
			),
		]).catch(() => {
			// If waiting for responses times out, just wait a bit and continue
			return new Promise((resolve) => setTimeout(resolve, 1000));
		});

		// Wait for loading state to disappear or confirm form is ready
		const formLoadingAgain = page.getByTestId("task-form-loading");
		const taskFormAgain = page.getByTestId("task-form");

		// Either wait for loading to disappear or form to be visible
		await Promise.race([
			expect(formLoadingAgain)
				.not.toBeVisible()
				.catch(() => {}),
			expect(taskFormAgain).toBeVisible(),
		]);

		// Wait for form elements
		await waitForElement(page, "task-title-input");
		await waitForElement(page, "task-description-input");

		// Update task details
		await page.getByTestId("task-title-input").fill("Updated Task");
		await page
			.getByTestId("task-description-input")
			.fill("Updated Description");

		// Click update button and wait for response
		const [updateResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 200,
			),
			page.getByTestId("submit-task-button").click(),
		]);

		// Wait for success message
		await waitForToast(page, "Task updated successfully");

		// Close task details
		await page.keyboard.press("Escape");
		await waitForNetworkIdle(page);

		// Verify changes are reflected using task ID
		await expect(page.getByTestId(`task-card-${task.id}`)).toBeVisible();
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
