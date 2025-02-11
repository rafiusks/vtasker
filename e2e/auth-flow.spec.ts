import { test, expect } from "@playwright/test";

test.describe("Authentication and Board Access Flow", () => {
	test("should register, login, create a board, and add a task", async ({
		page,
	}) => {
		// Enable console logging
		page.on("console", (msg) => console.log(msg.text()));
		page.on("pageerror", (error) => console.error("Page error:", error));
		page.on("requestfailed", (request) =>
			console.error(
				"Failed request:",
				request.url(),
				request.failure()?.errorText,
			),
		);

		// Go to homepage and wait for it to load
		await page.goto("/", { waitUntil: "networkidle", timeout: 30000 });

		// Log the page title and URL
		console.log("Page title:", await page.title());
		console.log("Current URL:", page.url());

		// Wait for the navigation links to be visible with increased timeout
		try {
			await Promise.all([
				page
					.getByRole("navigation")
					.getByRole("link", { name: "Login" })
					.waitFor({
						state: "visible",
						timeout: 30000,
					}),
				page
					.getByRole("navigation")
					.getByRole("link", { name: "Register" })
					.waitFor({
						state: "visible",
						timeout: 30000,
					}),
			]);
		} catch (error) {
			console.error("Failed to find navigation links:", error);
			// Log the page content for debugging
			console.log("Page content:", await page.content());
			throw error;
		}

		// Click the Register link
		await page
			.getByRole("navigation")
			.getByRole("link", { name: "Register" })
			.click();

		// Wait for registration form
		await page.waitForSelector("[data-testid='register-form']", {
			state: "visible",
			timeout: 30000,
		});

		// Generate unique email to avoid conflicts
		const uniqueEmail = `test${Date.now()}@example.com`;
		const password = "Test123!@#";

		// Fill registration form
		await page.getByTestId("name-input").fill("Test User");
		await page.getByTestId("email-input").fill(uniqueEmail);
		await page.getByTestId("password-input").fill(password);
		await page.getByTestId("confirm-password-input").fill(password);

		// Submit registration
		await page.getByRole("button", { name: "Create Account" }).click();

		// Wait for success message and redirect
		await expect(page.getByText("Registration successful")).toBeVisible({
			timeout: 5000,
		});

		// Should be redirected to login page
		await expect(page).toHaveURL("/login");

		// Fill login form
		await page.getByTestId("email-input").fill(uniqueEmail);
		await page.getByTestId("password-input").fill(password);

		// Submit login
		await page.getByRole("button", { name: "Login" }).click();

		// Wait for the auth token to be set and ready
		await page.waitForFunction(() => {
			const auth = window.sessionStorage.getItem("auth");
			if (!auth) return false;
			const authData = JSON.parse(auth);
			return authData.token && authData.user;
		});

		// Wait for token to be processed (small delay to match the setTokenSafely function)
		await page.waitForTimeout(100);

		// Wait for navigation to complete
		await page.waitForURL("/dashboard", { timeout: 10000 });

		// Wait for the boards list to be visible
		await page.waitForSelector("[data-testid='boards-list']", {
			state: "visible",
			timeout: 30000,
		});

		// Wait for the boards API request to complete
		await page.waitForResponse(
			(response) => {
				return (
					response.url().includes("/api/boards") && response.status() === 200
				);
			},
			{ timeout: 30000 },
		);

		// Wait for the boards page to be loaded
		await page.waitForSelector("[data-testid='create-board-button']", {
			state: "visible",
			timeout: 30000,
		});

		// Verify Create Board button is visible
		await expect(page.getByTestId("create-board-button")).toBeVisible({
			timeout: 10000,
		});

		// Click Create Board button
		await page.getByTestId("create-board-button").click();

		// Wait for modal to appear
		await page.waitForSelector("[data-testid='create-board-modal']", {
			state: "visible",
		});

		// Fill board form
		await page.getByTestId("board-name-input").fill("Test Board");
		await page
			.getByTestId("board-description-input")
			.fill("This is a test board");
		await page.getByTestId("board-public-checkbox").click();

		// Submit board creation
		await page.getByTestId("submit-create-board-button").click();

		// Wait for board to be created and navigation
		await Promise.all([
			page.waitForURL(/\/b\/[^/]+$/, { timeout: 30000 }),
			page.waitForSelector("[data-testid='board-content']", {
				state: "visible",
				timeout: 30000,
			}),
		]);

		// Wait for loading spinner to disappear
		await page.waitForSelector("[data-testid='loading-spinner']", {
			state: "detached",
			timeout: 10000,
		});

		// Wait for Create Task button to be visible
		await expect(page.getByTestId("create-task-button")).toBeVisible({
			timeout: 10000,
		});

		// Click Create Task button
		await page.getByTestId("create-task-button").click();

		// Wait for task form modal
		await page.waitForSelector("[data-testid='task-form']", {
			state: "visible",
			timeout: 10000,
		});

		// Wait for task statuses to be loaded
		await page.waitForFunction(
			() => {
				const taskStatuses = document.querySelector(
					"[data-testid='task-status-select']",
				);
				return taskStatuses && taskStatuses.children.length > 0;
			},
			{ timeout: 10000 },
		);

		// Fill task form
		await page.getByTestId("task-title-input").fill("Test Task");
		await page
			.getByTestId("task-description-input")
			.fill("This is a test task");
		await page.getByTestId("task-status-select").selectOption("1");
		await page.getByTestId("task-priority-select").selectOption("1");
		await page.getByTestId("task-type-select").selectOption("1");

		// Submit task creation
		await page.getByTestId("submit-task-button").click();

		// Wait for task to appear in the board
		await expect(page.getByText("Test Task")).toBeVisible({
			timeout: 10000,
		});
		await expect(page.getByText("This is a test task")).toBeVisible({
			timeout: 10000,
		});

		// Test drag and drop using mouse actions
		const taskCard = page.getByTestId("task-card").first();
		const targetColumn = page
			.locator("[data-testid='task-column-in_progress']")
			.first();

		// Get the bounding boxes
		const taskBox = await taskCard.boundingBox();
		const targetBox = await targetColumn.boundingBox();

		if (!taskBox || !targetBox) {
			throw new Error("Could not get element positions");
		}

		// Perform the drag and drop with delays
		await page.mouse.move(
			taskBox.x + taskBox.width / 2,
			taskBox.y + taskBox.height / 2,
		);
		await page.waitForTimeout(500); // Add delay after initial move

		await page.mouse.down();
		await page.waitForTimeout(500); // Add delay after mouse down

		await page.mouse.move(
			targetBox.x + targetBox.width / 2,
			targetBox.y + targetBox.height / 2,
			{ steps: 10 }, // Add smooth movement
		);
		await page.waitForTimeout(500); // Add delay after move to target

		await page.mouse.up();

		// Wait for the task to be moved
		await expect(
			targetColumn.getByText("Test Task", { exact: true }),
		).toBeVisible({
			timeout: 10000,
		});
	});
});
