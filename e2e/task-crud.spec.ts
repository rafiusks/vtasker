import { test, expect } from "@playwright/test";

test.describe("Task CRUD Operations", () => {
	test.beforeEach(async ({ page }) => {
		// Clear all tasks before each test
		await fetch("http://localhost:8000/api/tasks/clear", {
			method: "POST",
		});

		// Navigate to the app
		await page.goto("/");

		// Wait for the initial load
		await page.waitForSelector("[data-testid='loading-state']", {
			state: "hidden",
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
			await page.waitForSelector("select#priority option", {
				state: "attached",
			});
			await page.waitForSelector("select#type option", { state: "attached" });

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
			await page.waitForSelector("[data-testid='loading-state']", {
				state: "hidden",
			});
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

			// Wait for dialog to close and loading to finish
			await page.waitForSelector("[role='dialog']", { state: "hidden" });
			await page.waitForSelector("[data-testid='loading-state']", {
				state: "hidden",
			});

			// Wait for task list to refresh and stabilize
			await page.waitForTimeout(2000);

			// Reload the page to ensure we have the latest data
			await page.reload();
			await page.waitForSelector("[data-testid='loading-state']", {
				state: "hidden",
			});

			// Find the updated task card
			const updatedCard = page
				.locator("[data-testid='task-card']")
				.filter({ hasText: "Updated CRUD Task" });
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

			// Wait for task to be removed
			await expect(taskCard).not.toBeVisible({ timeout: 10000 });

			// Verify empty state
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

		// Verify task was created
		const taskCard = page
			.locator("[data-testid='task-card']")
			.filter({ hasText: "Test Task" });
		await expect(taskCard).toBeVisible();
	});
});
