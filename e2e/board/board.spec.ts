import { test, expect } from "@playwright/test";
import { loginTestUser, registerTestUser, waitForToast } from "../test-utils";

test.describe("Board Management", () => {
	test.beforeEach(async ({ page }) => {
		// Register and login a test user before each test
		const testUser = await registerTestUser(page);
		await loginTestUser(page, testUser);

		// Listen to console logs
		page.on("console", (msg) => {
			console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
		});
	});

	test("should create and delete a board", async ({ page }) => {
		// Navigate to boards page and wait for it to load
		await page.goto("/boards");
		await page.waitForLoadState("networkidle");

		// Click on "Create Board" button
		await page.getByTestId("create-board-button").click();

		// Verify the create board modal is open
		await expect(page.getByTestId("create-board-modal")).toBeVisible();

		// Fill in board details
		const boardName = "Test Board";
		const boardDescription = "This is a test board";
		await page.getByTestId("board-name-input").fill(boardName);
		await page.getByTestId("board-description-input").fill(boardDescription);

		// Create board and store the response
		const [createResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/boards") && response.status() === 201,
			),
			page.getByTestId("submit-create-board-button").click(),
		]);

		// Get the board ID from the response
		const board = await createResponse.json();
		console.log("Board created successfully:", board);

		// Wait for navigation to the new board page and network to be idle
		await page.waitForURL(/.*\/b\/.*/);
		await page.waitForLoadState("networkidle");

		// Verify board name is displayed
		await expect(page.getByText(boardName)).toBeVisible();

		// Open board settings
		await page.getByRole("button", { name: /board settings/i }).click();

		// Click delete button in settings modal
		await page
			.getByRole("button", { name: "Delete Board", exact: true })
			.click();

		// Wait for and verify delete confirmation dialog
		await expect(
			page.getByText(
				"Are you sure you want to delete this board? This action cannot be undone.",
			),
		).toBeVisible();

		// Click delete button and wait for response and navigation
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes(`/api/boards/${board.id}`) &&
					response.status() === 204,
			),
			page.getByRole("button", { name: "Delete", exact: true }).click(),
		]);

		// Wait for navigation back to boards page with more flexible pattern
		await page.waitForURL(/.*\/boards.*/, { waitUntil: "networkidle" });

		// Additional wait to ensure the board list is updated
		await page.waitForLoadState("networkidle");

		// Verify success message
		await waitForToast(page, "Board deleted successfully");

		// Verify the board is no longer in the list
		await expect(page.getByText(boardName)).not.toBeVisible();
	});

	test("should show validation errors for empty fields", async ({ page }) => {
		// Navigate to boards page and wait for it to load
		await page.goto("/boards");
		await page.waitForLoadState("networkidle");

		// Click on "Create Board" button
		await page.getByTestId("create-board-button").click();

		// Verify the create board modal is open
		await expect(page.getByTestId("create-board-modal")).toBeVisible();

		// Try to submit without filling required fields
		await page.getByTestId("submit-create-board-button").click();

		// Verify HTML5 validation message on the required field
		const nameInput = page.getByTestId("board-name-input");
		const validationMessage = await nameInput.evaluate(
			(el: HTMLInputElement) => el.validationMessage,
		);
		expect(validationMessage).toBeTruthy();
	});

	test("should show error for duplicate board name", async ({ page }) => {
		// Navigate to boards page and wait for it to load
		await page.goto("/boards");
		await page.waitForLoadState("networkidle");

		// Create first board
		await page.getByTestId("create-board-button").click();
		await page.getByTestId("board-name-input").fill("Duplicate Board");

		// Wait for first board creation and navigation
		const [firstBoardResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/boards") && response.status() === 201,
			),
			page.getByTestId("submit-create-board-button").click(),
		]);

		// Get the first board data
		const firstBoard = await firstBoardResponse.json();
		console.log("First board created:", firstBoard);

		// Wait for navigation and board to be fully loaded
		await page.waitForURL(/.*\/b\/.*/, { waitUntil: "networkidle" });
		await page.waitForLoadState("networkidle");

		// Try to create another board with same name
		await page.goto("/boards");
		await page.waitForLoadState("networkidle");
		await page.getByTestId("create-board-button").click();
		await page.getByTestId("board-name-input").fill("Duplicate Board");

		// Submit and expect error with increased timeout
		try {
			const [errorResponse] = await Promise.all([
				page.waitForResponse(
					(response) =>
						response.url().includes("/api/boards") && response.status() === 409,
					{ timeout: 30000 },
				),
				page.getByTestId("submit-create-board-button").click(),
			]);

			// Verify error response
			const errorData = await errorResponse.json();
			expect(errorData.error).toBe("Board name already exists");

			// Verify error message in toast
			await waitForToast(page, "Board name already exists");
		} catch (error) {
			console.error("Error during duplicate board test:", error);
			throw error;
		}
	});

	test("should handle modal interactions", async ({ page }) => {
		// Navigate to boards page and wait for it to load
		await page.goto("/boards");
		await page.waitForLoadState("networkidle");

		// Open modal
		await page.getByTestId("create-board-button").click();
		await expect(page.getByTestId("create-board-modal")).toBeVisible();

		// Test closing with cancel button
		await page.getByTestId("cancel-create-board-button").click();
		await expect(page.getByTestId("create-board-modal")).not.toBeVisible();

		// Wait a moment to ensure modal is fully closed
		await page.waitForTimeout(500);

		// Reopen modal
		await page.getByTestId("create-board-button").click();
		await expect(page.getByTestId("create-board-modal")).toBeVisible();

		// Test clicking outside (on the backdrop)
		await page.getByTestId("modal-backdrop").click();

		// Wait for modal to be hidden and verify
		await expect(page.getByTestId("create-board-modal")).not.toBeVisible();
	});
});
