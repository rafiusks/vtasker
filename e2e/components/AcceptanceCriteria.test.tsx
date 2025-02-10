import { test, expect } from "@playwright/test";

test.describe("AcceptanceCriteria", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the app and open a task form to test acceptance criteria
		await page.goto("/");
		await page.getByRole("button", { name: "Create Task" }).click();
		await page.waitForSelector("[role='dialog']", { state: "visible" });
	});

	test("should add and display criteria", async ({ page }) => {
		// Add first criterion
		await page.getByTestId("acceptance-criteria-input").fill("First criterion");
		await page.getByTestId("add-criterion-button").click();
		await page.waitForSelector("[data-testid='acceptance-criterion']");

		// Add second criterion
		await page
			.getByTestId("acceptance-criteria-input")
			.fill("Second criterion");
		await page.getByTestId("add-criterion-button").click();

		// Verify criteria are displayed
		const criteria = await page
			.locator("[data-testid='acceptance-criterion-description']")
			.all();
		expect(criteria.length).toBe(2);
		await expect(criteria[0]).toHaveText("First criterion");
		await expect(criteria[1]).toHaveText("Second criterion");
	});

	test("should toggle criteria completion", async ({ page }) => {
		// Add a criterion
		await page.getByTestId("acceptance-criteria-input").fill("Test criterion");
		await page.getByTestId("add-criterion-button").click();
		await page.waitForSelector("[data-testid='acceptance-criterion']");

		// Toggle completion
		await page.getByTestId("acceptance-criterion-checkbox").click();

		// Verify completion state
		await expect(
			page.locator("[data-testid='acceptance-criterion-description']"),
		).toHaveClass(/text-gray-500 line-through/);
	});

	test("should validate empty criterion", async ({ page }) => {
		// Try to add empty criterion
		await page.getByTestId("acceptance-criteria-input").fill("");
		await page.getByTestId("add-criterion-button").click();

		// Verify error state
		await expect(page.getByTestId("acceptance-criteria-input")).toHaveAttribute(
			"aria-invalid",
			"true",
		);
		await expect(page.locator("#criterion-error")).toBeVisible();
		await expect(page.locator("#criterion-error")).toHaveText(
			"Description is required",
		);
	});
});
