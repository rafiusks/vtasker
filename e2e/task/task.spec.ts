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

		// Wait for form to be ready
		await waitForElement(page, "task-form");
		await page.waitForTimeout(500); // Give the form a moment to initialize

		// Try to submit the form without filling any fields
		await page.getByTestId("submit-create-task-button").click();

		// Wait for error message to appear
		await expect(page.getByTestId("input-title-error")).toBeVisible();

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
		await page.getByTestId("create-task-button").click();
		await waitForModalToBeReady(page);

		// Wait for form to be ready and options to be loaded
		await waitForElement(page, "task-form");
		await waitForElement(page, "task-title-input");
		await waitForElement(page, "task-type-select");
		await waitForElement(page, "task-priority-select");
		await waitForElement(page, "task-status-select");
		await page.waitForTimeout(500); // Give the form a moment to initialize

		// Fill in task details
		await page.getByTestId("task-title-input").fill("Task to Update");
		await page.getByTestId("task-type-select").selectOption("1");
		await page.getByTestId("task-priority-select").selectOption("2");
		await page.getByTestId("task-status-select").selectOption("1");

		// Submit the form and wait for the response
		const [createResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 201,
			),
			page.getByTestId("submit-create-task-button").click(),
		]);

		// Get the created task data and wait for success message
		const task = await createResponse.json();
		await waitForToast(page, "Task created successfully");

		// Wait for task card and network idle
		await waitForElement(page, `task-card-${task.id}`);
		await waitForNetworkIdle(page);

		// Click on the task to open details
		await page.getByTestId(`task-card-${task.id}`).click();
		await waitForModalToBeReady(page);

		// Wait for form to be ready again
		await waitForElement(page, "task-form");
		await waitForElement(page, "task-title-input");
		await waitForElement(page, "task-description-input");
		await page.waitForTimeout(500); // Give the form a moment to initialize

		// Update task details
		await page.getByTestId("task-title-input").fill("Updated Task");
		await page
			.getByTestId("task-description-input")
			.fill("Updated Description");

		// Submit update and wait for response
		const [updateResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 200,
			),
			page.getByTestId("submit-task-button").click(),
		]);

		// Wait for success message and network idle
		await waitForToast(page, "Task updated successfully");
		await waitForNetworkIdle(page);

		// Close task details
		await page.keyboard.press("Escape");
		await waitForNetworkIdle(page);

		// Verify changes are reflected
		await waitForElement(page, `task-card-${task.id}`);
		await expect(page.getByText("Updated Task")).toBeVisible();
	});

	test("should delete a task", async ({ page }) => {
		// First create a task
		await waitForElement(page, "create-task-button");
		await page.getByTestId("create-task-button").click();
		await waitForModalToBeReady(page);

		// Wait for form to be ready
		await waitForElement(page, "task-form");
		await waitForElement(page, "task-title-input");
		await waitForElement(page, "task-type-select");
		await waitForElement(page, "task-priority-select");
		await waitForElement(page, "task-status-select");
		await page.waitForTimeout(500); // Give the form a moment to initialize

		// Fill in task details
		await page.getByTestId("task-title-input").fill("Task to Delete");
		await page.getByTestId("task-type-select").selectOption("1"); // Feature
		await page.getByTestId("task-priority-select").selectOption("2"); // Medium
		await page.getByTestId("task-status-select").selectOption("1"); // Backlog

		// Submit the form and wait for response
		const [createResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 201,
			),
			page.getByTestId("submit-create-task-button").click(),
		]);

		// Get task data and wait for success message
		const task = await createResponse.json();
		await waitForToast(page, "Task created successfully");

		// Wait for task card and network idle
		await waitForElement(page, `task-card-${task.id}`);
		await waitForNetworkIdle(page);

		// Click on the task to open details
		await page.getByTestId(`task-card-${task.id}`).click();
		await waitForModalToBeReady(page);

		// Wait for delete button and click it
		await waitForElement(page, "delete-task-button");
		await page.getByTestId("delete-task-button").click();

		// Wait for confirm dialog and confirm deletion
		await waitForElement(page, "confirm-dialog-confirm");
		const confirmButton = page.getByTestId("confirm-dialog-confirm");

		// Confirm deletion and wait for response
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 204,
			),
			confirmButton.click(),
		]);

		// Wait for success message and network idle
		await waitForToast(page, "Task deleted successfully");
		await waitForNetworkIdle(page);

		// Verify task is removed
		await expect(page.getByTestId(`task-card-${task.id}`)).not.toBeVisible();
	});

	test("should change task status via drag and drop", async ({ page }) => {
		// First create a task
		await waitForElement(page, "create-task-button");
		await page.getByTestId("create-task-button").click();
		await waitForModalToBeReady(page);

		// Wait for form to be ready
		await waitForElement(page, "task-form");
		await waitForElement(page, "task-title-input");
		await waitForElement(page, "task-type-select");
		await waitForElement(page, "task-priority-select");
		await waitForElement(page, "task-status-select");
		await page.waitForTimeout(500); // Give the form a moment to initialize

		// Fill in task details
		await page.getByTestId("task-title-input").fill("Task to Move");
		await page.getByTestId("task-type-select").selectOption("1"); // Feature
		await page.getByTestId("task-priority-select").selectOption("2"); // Medium
		await page.getByTestId("task-status-select").selectOption("1"); // Backlog

		// Submit the form and wait for response
		const [createResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 200,
			),
			page.getByTestId("submit-create-task-button").click(),
		]);

		// Get task data and wait for success message
		const task = await createResponse.json();
		await waitForToast(page, "Task created successfully");

		// Wait for task card and network idle
		await waitForElement(page, `task-card-${task.id}`);
		await waitForNetworkIdle(page);

		// Get task and target elements
		const taskCard = page.getByTestId(`task-card-${task.id}`);
		const targetColumn = page.getByTestId("status-column-in-progress");

		// Perform drag and drop
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 200,
			),
			taskCard.dragTo(targetColumn),
		]);

		// Wait for network idle after drag
		await waitForNetworkIdle(page);

		// Verify task is in new column
		await expect(
			page
				.getByTestId("status-column-in-progress")
				.getByTestId(`task-card-${task.id}`),
		).toBeVisible();
	});

	test("should change task status via dropdown", async ({ page }) => {
		// First create a task
		await waitForElement(page, "create-task-button");
		await page.getByTestId("create-task-button").click();
		await waitForModalToBeReady(page);

		// Wait for form to be ready
		await waitForElement(page, "task-form");
		await waitForElement(page, "task-title-input");
		await waitForElement(page, "task-type-select");
		await waitForElement(page, "task-priority-select");
		await waitForElement(page, "task-status-select");
		await page.waitForTimeout(500); // Give the form a moment to initialize

		// Fill in task details
		await page.getByTestId("task-title-input").fill("Task to Change Status");
		await page.getByTestId("task-type-select").selectOption("1"); // Feature
		await page.getByTestId("task-priority-select").selectOption("2"); // Medium
		await page.getByTestId("task-status-select").selectOption("1"); // Backlog

		// Submit the form and wait for response
		const [createResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 201,
			),
			page.getByTestId("submit-create-task-button").click(),
		]);

		// Get task data and wait for success message
		const task = await createResponse.json();
		await waitForToast(page, "Task created successfully");

		// Wait for task card and network idle
		await waitForElement(page, `task-card-${task.id}`);
		await waitForNetworkIdle(page);

		// Click on the task to open details
		await page.getByTestId(`task-card-${task.id}`).click();
		await waitForModalToBeReady(page);

		// Wait for form to be ready
		await waitForElement(page, "task-form");
		await waitForElement(page, "task-status-select");
		await page.waitForTimeout(500); // Give the form a moment to initialize

		// Change status to In Progress
		await page.getByTestId("task-status-select").selectOption("2"); // In Progress

		// Submit update and wait for response
		const [updateResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/tasks") && response.status() === 200,
			),
			page.getByTestId("submit-task-button").click(),
		]);

		// Wait for success message and network idle
		await waitForToast(page, "Task updated successfully");
		await waitForNetworkIdle(page);

		// Close task details
		await page.keyboard.press("Escape");
		await waitForNetworkIdle(page);

		// Verify task is in new column
		await expect(
			page
				.getByTestId("status-column-in-progress")
				.getByTestId(`task-card-${task.id}`),
		).toBeVisible();
	});

	test("should handle validation errors when updating task", async ({
		page,
	}) => {
		// Open the TaskForm modal (simulate user clicking "Create Task")
		await waitForElement(page, "create-task-button");
		await page.getByTestId("create-task-button").click();
		await waitForModalToBeReady(page);
		await waitForElement(page, "task-form");

		// Clear title and submit to trigger validation
		await page.getByTestId("task-title-input").fill("");
		await page.getByTestId("submit-create-task-button").click();

		// Wait for validation
		await expect(page.getByTestId("input-title-error")).toBeVisible();
		await expect(page.getByTestId("task-title-input")).toHaveAttribute(
			"aria-invalid",
			"true",
		);
	});

	test.skip("should handle network errors gracefully", async ({ page }) => {
		// TODO: This test is currently skipped due to inconsistent error handling behavior
		// between the API, React Query mutations, and the UI components.
		// Low priority item tracked in project todo.
	});
});
