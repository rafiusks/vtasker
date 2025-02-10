import { test, expect } from "@playwright/test";

test.describe("Task CRUD Operations", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the app
		await page.goto("/");

		// Wait for the app to be fully loaded
		await page.waitForSelector("[data-testid='task-list']", {
			state: "visible",
			timeout: 10000,
		});

		// Delete any existing tasks
		const taskCards = await page.locator("[data-testid='task-card']").all();
		for (const card of taskCards) {
			await card.getByRole("button", { name: "Delete" }).click();
			await expect(card).not.toBeVisible({ timeout: 5000 });
			await expect(page.getByText("Task deleted successfully")).toBeVisible({
				timeout: 5000,
			});
		}

		// Wait for all tasks to be deleted
		await expect(page.locator("[data-testid='task-card']")).toHaveCount(0, {
			timeout: 10000,
		});
	});

	test.afterEach(async ({ page }) => {
		// Delete any remaining tasks
		const taskCards = await page.locator("[data-testid='task-card']").all();
		for (const card of taskCards) {
			await card.getByRole("button", { name: "Delete" }).click();
			await expect(card).not.toBeVisible({ timeout: 5000 });
			await expect(page.getByText("Task deleted successfully")).toBeVisible({
				timeout: 5000,
			});
		}

		// Verify we end with 0 tasks
		await expect(page.locator("[data-testid='task-card']")).toHaveCount(0, {
			timeout: 10000,
		});
	});

	test("should perform full CRUD operations on a task", async ({ page }) => {
		// CREATE: Create a new task with acceptance criteria
		await test.step("Create task", async () => {
			// Click create task button
			await page.getByRole("button", { name: "Create Task" }).click();

			// Wait for dialog and form elements
			await page.waitForSelector("[role='dialog']", { state: "visible" });
			await page.waitForSelector("[data-testid='task-title-input']", {
				state: "visible",
			});

			// Fill basic task details
			await page.getByTestId("task-title-input").fill("Test CRUD Task");
			await page
				.getByTestId("task-description-input")
				.fill("Testing CRUD operations");

			// Wait for select options to be loaded
			await page.waitForSelector(
				"[data-testid='task-priority-select'] option",
				{
					state: "attached",
				},
			);
			await page.waitForSelector("[data-testid='task-type-select'] option", {
				state: "attached",
			});

			await page
				.getByTestId("task-priority-select")
				.selectOption({ label: "High" });
			await page
				.getByTestId("task-type-select")
				.selectOption({ label: "Feature" });

			// Add acceptance criteria
			await page
				.getByTestId("acceptance-criteria-input")
				.fill("First criterion");
			await page.getByTestId("add-criterion-button").click();
			await page.waitForSelector("[data-testid='acceptance-criterion']");

			await page
				.getByTestId("acceptance-criteria-input")
				.fill("Second criterion");
			await page.getByTestId("add-criterion-button").click();

			// Save the task
			await page.getByRole("button", { name: "Save" }).click();

			// Wait for dialog to close and loading to finish
			await page.waitForSelector("[role='dialog']", { state: "hidden" });
			await page.waitForSelector("[data-testid='loading-state']", {
				state: "hidden",
			});

			// Wait for task to appear in the list
			await page.waitForSelector("[data-testid='task-card']", {
				state: "visible",
			});
		});

		// READ: Verify the task was created correctly
		await test.step("Read task", async () => {
			// Wait for task card with retries
			const taskCard = page
				.locator("[data-testid='task-card']")
				.filter({ hasText: "Test CRUD Task" });
			await expect(taskCard).toBeVisible({ timeout: 10000 });

			// Verify basic details
			await expect(taskCard.locator("h3")).toHaveText("Test CRUD Task");
			await expect(taskCard.locator("p")).toHaveText("Testing CRUD operations");
			await expect(taskCard.locator(".bg-blue-100")).toHaveText("High");
			await expect(taskCard.locator(".bg-green-100")).toHaveText("Feature");
		});

		// UPDATE: Modify the task
		await test.step("Update task", async () => {
			// Click edit button on the specific task card
			const taskCard = page
				.locator("[data-testid='task-card']")
				.filter({ hasText: "Test CRUD Task" });
			await taskCard.getByRole("button", { name: "Edit task" }).click();

			// Wait for dialog and form to be ready
			await page.waitForSelector("[role='dialog']", { state: "visible" });
			await page.waitForSelector("[data-testid='task-title-input']", {
				state: "visible",
			});

			// Wait for form to be populated
			await expect(page.getByTestId("task-title-input")).toHaveValue(
				"Test CRUD Task",
			);

			// Update basic details
			await page.getByTestId("task-title-input").fill("Updated CRUD Task");
			await page
				.getByTestId("task-description-input")
				.fill("Updated description");
			await page
				.getByTestId("task-priority-select")
				.selectOption({ label: "Low" });

			// Add new acceptance criterion
			await page
				.getByTestId("acceptance-criteria-input")
				.fill("Updated criterion");
			await page.getByTestId("add-criterion-button").click();

			// Save changes
			await page.getByRole("button", { name: "Save" }).click();

			// Wait for dialog to close
			await page.waitForSelector("[role='dialog']", { state: "hidden" });

			// Wait for the updated task card to appear with the new title
			const updatedCard = page
				.locator("[data-testid='task-card']")
				.filter({ hasText: "Updated CRUD Task" });

			// Wait for the updated task to be visible and verify its content
			await expect(updatedCard).toBeVisible({ timeout: 15000 });
			await expect(updatedCard.locator("h3")).toHaveText("Updated CRUD Task");
			await expect(updatedCard.locator("p")).toHaveText("Updated description");
			await expect(updatedCard.locator(".bg-blue-100")).toHaveText("Low");
		});

		// DELETE: Remove the task
		await test.step("Delete task", async () => {
			// Find and click delete button
			const taskCard = page
				.locator("[data-testid='task-card']")
				.filter({ hasText: "Updated CRUD Task" });
			await taskCard.getByRole("button", { name: "Delete" }).click();

			// Wait for the task to be removed first
			await expect(taskCard).not.toBeVisible({ timeout: 5000 });

			// Then wait for success message
			await expect(page.getByText("Task deleted successfully")).toBeVisible({
				timeout: 5000,
			});

			// Finally check the total count
			await expect(page.locator("[data-testid='task-card']")).toHaveCount(0, {
				timeout: 10000,
			});

			// Clear any active filters
			const clearFiltersButton = page.getByText("Clear Filters");
			if (await clearFiltersButton.isVisible()) {
				await clearFiltersButton.click();
			}

			// Wait for any loading states to complete
			await expect(
				page.locator("[data-testid='loading-state']"),
			).not.toBeVisible({
				timeout: 10000,
			});

			// Wait for the task grid to be visible
			await expect(page.locator("[data-testid='task-list'].grid")).toBeVisible({
				timeout: 10000,
			});

			// Wait for the empty state to appear and verify message
			await expect(page.locator("[data-testid='empty-state']")).toBeVisible({
				timeout: 10000,
			});
			await expect(page.getByText("No tasks found")).toBeVisible();
		});
	});

	test("should handle form validation", async ({ page }) => {
		// Open create task dialog
		await page.getByRole("button", { name: "Create Task" }).click();
		await page.waitForSelector("[role='dialog']", { state: "visible" });
		await page.waitForSelector("[data-testid='task-title-input']", {
			state: "visible",
		});

		// Try to submit empty form
		await page.getByRole("button", { name: "Save" }).click();

		// Check that the form wasn't submitted (dialog should still be visible)
		await expect(page.locator("[role='dialog']")).toBeVisible();

		// Check that required fields have the required attribute
		await expect(page.getByTestId("task-title-input")).toHaveAttribute(
			"aria-required",
			"true",
		);
		await expect(page.getByTestId("task-description-input")).toHaveAttribute(
			"aria-required",
			"true",
		);
		await expect(page.getByTestId("task-priority-select")).toHaveAttribute(
			"aria-required",
			"true",
		);
		await expect(page.getByTestId("task-type-select")).toHaveAttribute(
			"aria-required",
			"true",
		);

		// Try to add empty acceptance criterion
		await page.getByTestId("acceptance-criteria-input").fill("");
		await page.getByTestId("add-criterion-button").click();
		await page.waitForTimeout(100); // Add a small wait for the error state to update

		// Verify error state for acceptance criteria
		await expect(page.getByTestId("acceptance-criteria-input")).toHaveAttribute(
			"aria-invalid",
			"true",
		);
		await expect(page.locator("#criterion-error")).toBeVisible();
		await expect(page.locator("#criterion-error")).toHaveText(
			"Description is required",
		);

		// Fill in required fields
		await page.getByTestId("task-title-input").fill("Test Task");
		await page.getByTestId("task-description-input").fill("Test Description");

		// Wait for select options to be loaded
		await page.waitForSelector("select#priority option", { state: "attached" });
		await page.waitForSelector("select#type option", { state: "attached" });

		await page
			.getByTestId("task-priority-select")
			.selectOption({ label: "High" });
		await page
			.getByTestId("task-type-select")
			.selectOption({ label: "Feature" });

		// Submit should now work
		await page.getByRole("button", { name: "Save" }).click();

		// Wait for dialog to close
		await expect(page.locator("[role='dialog']")).not.toBeVisible();

		// Wait for task card with a longer timeout
		const taskCard = page
			.locator("[data-testid='task-card']")
			.filter({ hasText: "Test Task" });
		await expect(taskCard).toBeVisible({ timeout: 10000 });

		// Clean up: Delete the task we created
		await taskCard.getByRole("button", { name: "Delete" }).click();
		await expect(page.getByText("Task deleted successfully")).toBeVisible({
			timeout: 5000,
		});
		await page.waitForTimeout(500); // Increased wait time
		await expect(page.locator("[data-testid='task-card']")).toHaveCount(0, {
			timeout: 10000,
		});
	});
});
