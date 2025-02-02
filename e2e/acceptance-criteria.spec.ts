import { test, expect } from "@playwright/test";

test.describe("Acceptance Criteria", () => {
	let createdTaskId: string;

	test.beforeEach(async ({ page }) => {
		// Start from a known task with acceptance criteria
		await page.goto("/");

		// Wait for the initial data load
		await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });

		// Wait for any loading states to resolve
		await page.waitForLoadState("networkidle");

		// Create a new task with acceptance criteria
		await page.getByRole("button", { name: "New Task" }).click();

		// Fill in task details
		await page.getByLabel("Title").fill("Test Task with Criteria");
		await page
			.getByLabel("Description")
			.fill("This is a test task with acceptance criteria");

		// Add acceptance criteria
		const criteriaInput = page.getByPlaceholder("Add acceptance criterion...");
		await criteriaInput.fill("First acceptance criterion");
		await criteriaInput.press("Enter");
		await criteriaInput.fill("Second acceptance criterion");
		await criteriaInput.press("Enter");

		// Save the task and get its ID from the response
		const responsePromise = page.waitForResponse(
			(response) =>
				response.url().includes("/api/tasks") &&
				response.request().method() === "POST",
		);
		await page.getByRole("button", { name: "Create Task" }).click();
		const response = await responsePromise;
		const taskData = await response.json();
		console.log("Created task:", JSON.stringify(taskData, null, 2));
		createdTaskId = taskData.id;

		// Do a hard refresh to ensure we load from storage
		await page.reload();

		// Wait for the task list to load
		await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });

		// Wait for our specific task to be visible
		await page.waitForSelector(`text="Test Task with Criteria"`, {
			timeout: 10000,
		});

		// Find our specific task card and click its edit button
		const taskCard = page
			.locator('[data-testid="task-card"]')
			.filter({ hasText: "Test Task with Criteria" });

		// Wait for any overlays to be gone
		await page
			.waitForSelector("#headlessui-portal-root", {
				state: "hidden",
				timeout: 10000,
			})
			.catch(() => {});

		// Click the edit button
		await taskCard.locator('button[title="Edit task"]').first().click();

		// Wait for the edit form to be visible
		await page.waitForSelector('text="Edit Task"', { timeout: 10000 });

		// Wait for acceptance criteria to be visible
		await page.waitForSelector('[data-testid="acceptance-criterion"]', {
			timeout: 10000,
			state: "visible",
		});

		// Log the current state of acceptance criteria
		const criteria = await page
			.locator('[data-testid="acceptance-criterion"]')
			.all();
		console.log("Number of criteria:", criteria.length);
		for (const criterion of criteria) {
			const description = await criterion.locator(".text-sm").textContent();
			console.log("Criterion description:", description);
		}
	});

	test.afterEach(async ({ page }) => {
		// Delete the task after each test
		if (createdTaskId) {
			const deleteResponse = await fetch(
				`http://localhost:3000/api/tasks/${createdTaskId}`,
				{
					method: "DELETE",
				},
			);
			if (!deleteResponse.ok) {
				console.error(`Failed to delete task ${createdTaskId}`);
			}
		}
	});

	test("should render acceptance criteria correctly", async ({ page }) => {
		// Wait for acceptance criteria to be visible
		await page.waitForSelector('[data-testid="acceptance-criterion"]', {
			timeout: 10000,
			state: "visible",
		});

		// Check that acceptance criteria are rendered correctly
		const criteria = await page
			.locator('[data-testid="acceptance-criterion"]')
			.all();

		// Verify we have the correct number of criteria
		expect(criteria.length).toBe(2); // We added 2 criteria in beforeEach

		// Check each criterion
		for (const criterion of criteria) {
			// Get the description text
			const description = await criterion.locator(".text-sm").textContent();
			console.log("Found criterion description:", description);

			// Verify the description matches one of our expected values
			expect(description).toMatch(
				/First acceptance criterion|Second acceptance criterion/,
			);

			// Verify checkbox is present
			const checkbox = await criterion.locator("button");
			expect(await checkbox.isVisible()).toBe(true);
		}

		// Check progress bar and text
		const progressText = await page
			.locator('[data-testid="criteria-progress-text"]')
			.textContent();
		expect(progressText).toBe("0 of 2 completed (0%)");

		// The progress bar container should be visible
		const progressContainer = page.locator(
			'[data-testid="criteria-progress-container"]',
		);
		await expect(progressContainer).toBeVisible();

		// The progress bar should have 0% progress
		const progressBar = page.locator('[data-testid="criteria-progress"]');
		await expect(progressBar).toHaveAttribute("aria-valuenow", "0");
	});

	test("should handle checkbox interactions", async ({ page }) => {
		// Wait for acceptance criteria to be visible
		await page.waitForSelector('[data-testid="acceptance-criterion"]', {
			timeout: 10000,
			state: "visible",
		});

		// Get an unchecked criterion
		const uncheckedCriterion = await page
			.locator('[data-testid="acceptance-criterion"]')
			.first();

		// Get the initial progress text
		const initialProgressText = await page
			.locator('[data-testid="criteria-progress-text"]')
			.textContent();
		expect(initialProgressText).toBe("0 of 2 completed (0%)");

		// Click the checkbox
		await uncheckedCriterion.locator("button").click();

		// Wait for the checkbox to be checked
		await expect(uncheckedCriterion.locator("button")).toHaveClass(
			/bg-blue-600/,
		);

		// Verify the description is strikethrough
		await expect(uncheckedCriterion.locator(".text-sm")).toHaveClass(
			/line-through/,
		);

		// Verify progress bar updates
		const progressContainer = page.locator(
			'[data-testid="criteria-progress-container"]',
		);
		await expect(progressContainer).toBeVisible();

		const progressBar = page.locator('[data-testid="criteria-progress"]');
		await expect(progressBar).toHaveAttribute("aria-valuenow", "50");

		// Verify progress text updates
		const updatedProgressText = await page
			.locator('[data-testid="criteria-progress-text"]')
			.textContent();
		expect(updatedProgressText).toBe("1 of 2 completed (50%)");

		// Do a hard refresh to verify persistence
		await page.reload();

		// Wait for the task to load and reopen edit form
		await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });
		const taskCard = page
			.locator('[data-testid="task-card"]')
			.filter({ hasText: "Test Task with Criteria" });
		await taskCard.locator('button[title="Edit task"]').first().click();

		// Verify the checkbox state persisted
		await page.waitForSelector('[data-testid="acceptance-criterion"]', {
			timeout: 10000,
			state: "visible",
		});
		const firstCriterion = page
			.locator('[data-testid="acceptance-criterion"]')
			.first();
		await expect(firstCriterion.locator("button")).toHaveClass(/bg-blue-600/);
		await expect(firstCriterion.locator(".text-sm")).toHaveClass(
			/line-through/,
		);
	});

	test("should require description for new criteria", async ({ page }) => {
		// Wait for acceptance criteria to be visible
		await page.waitForSelector('[data-testid="acceptance-criterion"]', {
			timeout: 10000,
			state: "visible",
		});

		// Try to add an empty criterion
		const criteriaInput = page.getByPlaceholder("Add acceptance criterion...");
		await criteriaInput.fill("   "); // Just whitespace
		await criteriaInput.press("Enter");

		// Verify no new criterion was added
		const criteria = await page
			.locator('[data-testid="acceptance-criterion"]')
			.all();
		expect(criteria.length).toBe(2); // Still just the original 2 criteria

		// Try to add a valid criterion
		await criteriaInput.fill("New valid criterion");
		await criteriaInput.press("Enter");

		// Verify the new criterion was added
		const updatedCriteria = await page
			.locator('[data-testid="acceptance-criterion"]')
			.all();
		expect(updatedCriteria.length).toBe(3);

		// Verify the new criterion has the correct description
		const newCriterion = updatedCriteria[2];
		const description = await newCriterion.locator(".text-sm").textContent();
		expect(description).toBe("New valid criterion");

		// Do a hard refresh to verify persistence
		await page.reload();

		// Wait for the task to load and reopen edit form
		await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });
		const taskCard = page
			.locator('[data-testid="task-card"]')
			.filter({ hasText: "Test Task with Criteria" });
		await taskCard.locator('button[title="Edit task"]').first().click();

		// Verify all criteria are still present with correct descriptions
		await page.waitForSelector('[data-testid="acceptance-criterion"]', {
			timeout: 10000,
			state: "visible",
		});
		const persistedCriteria = await page
			.locator('[data-testid="acceptance-criterion"]')
			.all();
		expect(persistedCriteria.length).toBe(3);

		// Verify the descriptions
		for (const criterion of persistedCriteria) {
			const description = await criterion.locator(".text-sm").textContent();
			expect(description).toBeTruthy();
			expect(description).toMatch(
				/First acceptance criterion|Second acceptance criterion|New valid criterion/,
			);
		}
	});
});
