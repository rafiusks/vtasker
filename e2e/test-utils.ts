import type { Page } from "@playwright/test";
import { expect, request } from "@playwright/test";

// Types
export interface TestUser {
	fullName: string;
	email: string;
	password: string;
	token?: string;
}

// Test Data Generation
export function generateTestUser(prefix = "") {
	const timestamp = Date.now();
	return {
		fullName: `Test User ${prefix}${timestamp}`,
		email: `test${prefix}${timestamp}@example.com`,
		password: "Test@123",
	};
}

// API-based Setup Functions
export async function setupTestUserViaApi(): Promise<TestUser> {
	const baseUser = generateTestUser();
	
	// Clean up any existing test data first
	await cleanupTestData().catch(error => {
		console.warn("Failed to cleanup test data:", error);
	});

	const context = await request.newContext({
		baseURL: "http://localhost:8000",
		extraHTTPHeaders: { 'Content-Type': 'application/json' },
	});

	try {
		// Register user
		const registerResponse = await context.post("/api/auth/register", {
			data: {
				full_name: baseUser.fullName,
				email: baseUser.email,
				password: baseUser.password,
				confirm_password: baseUser.password
			}
		});

		if (!registerResponse.ok()) {
			throw new Error(`Failed to register test user: ${await registerResponse.text()}`);
		}

		// Login to get token
		const loginResponse = await context.post("/api/auth/login", {
			data: {
				email: baseUser.email,
				password: baseUser.password
			}
		});

		if (!loginResponse.ok()) {
			throw new Error(`Failed to login test user: ${await loginResponse.text()}`);
		}

		const { token } = await loginResponse.json();
		
		// Create a new user object with the token
		const user: TestUser = {
			...baseUser,
			token
		};

		return user;
	} finally {
		await context.dispose();
	}
}

export async function createTestBoardViaApi(token: string) {
	const context = await request.newContext({
		baseURL: "http://localhost:8000",
		extraHTTPHeaders: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
	});

	try {
		const response = await context.post("/api/boards", {
			data: {
				name: `Test Board ${Date.now()}`,
				description: "Test board for e2e tests"
			}
		});

		if (!response.ok()) {
			throw new Error(`Failed to create test board: ${await response.text()}`);
		}

		return await response.json();
	} finally {
		await context.dispose();
	}
}

export async function cleanupTestData(token?: string, retries = 3): Promise<void> {
	const context = await request.newContext({
		baseURL: "http://localhost:8000",
		extraHTTPHeaders: {
			'Content-Type': 'application/json',
			...(token ? { 'Authorization': `Bearer ${token}` } : {})
		},
	});

	try {
		let success = false;
		let attempt = 0;

		while (!success && attempt < retries) {
			try {
				console.log(`Cleanup attempt ${attempt + 1}/${retries}`);

				// Delete tasks first (they depend on boards)
				await context.delete("/api/tasks/cleanup-test");
				console.log("Tasks cleanup completed");

				// Delete boards (they depend on users)
				await context.delete("/api/boards/cleanup-test");
				console.log("Boards cleanup completed");

				// Finally delete users
				await context.delete("/api/users/cleanup-test");
				console.log("Users cleanup completed");

				// Wait a bit to ensure cleanup is complete
				await new Promise(resolve => setTimeout(resolve, 1000));

				// Verify cleanup by checking if any test users exist
				const checkResponse = await context.get("/api/users/search?q=test@example.com");
				const { users = [] } = await checkResponse.json().catch(() => ({ users: [] }));
				
				if (users.length === 0) {
					console.log("Cleanup verification successful");
					success = true;
				} else {
					console.warn(`Cleanup verification failed, found ${users.length} test users`);
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			} catch (error) {
				console.warn(`Cleanup attempt ${attempt + 1} failed:`, error);
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
			attempt++;
		}

		if (!success) {
			throw new Error(`Failed to cleanup test data after ${retries} attempts`);
		}
	} finally {
		await context.dispose();
	}
}

// UI Helper Functions
export async function expectToBeOnPage(page: Page, path: string) {
	await expect(page).toHaveURL(new RegExp(`${path}$`));
}

export async function clearInput(page: Page, selector: string) {
	await page.locator(selector).click();
	await page.keyboard.press("Meta+A");
	await page.keyboard.press("Backspace");
}

export async function waitForToast(page: Page, text: string) {
	try {
		await expect(page.getByText(text).first()).toBeVisible({ timeout: 15000 });
	} catch (error) {
		console.error(`Toast with text "${text}" not found within timeout`);
		throw error;
	}
}

export async function waitForElement(page: Page, testId: string) {
	try {
		await expect(page.getByTestId(testId)).toBeVisible({ timeout: 15000 });
	} catch (error) {
		console.error(`Element with testId "${testId}" not found within timeout`);
		throw error;
	}
}

export async function waitForModalToBeReady(page: Page) {
	try {
		await waitForElement(page, "task-modal");
		// Wait for modal animation and form initialization
		await page.waitForTimeout(1000);
		// Wait for form fields to be ready
		await Promise.all([
			waitForElement(page, "task-title-input"),
			waitForElement(page, "task-description-input"),
			waitForElement(page, "task-type-select"),
			waitForElement(page, "task-priority-select"),
			waitForElement(page, "task-status-select")
		]);
	} catch (error) {
		console.error("Modal not ready within timeout");
		throw error;
	}
}

export async function waitForNetworkIdle(page: Page) {
	try {
		await page.waitForLoadState("networkidle", { timeout: 15000 });
	} catch (error) {
		console.error("Network did not become idle within timeout");
		throw error;
	}
}

// UI-based Setup Functions (for auth/registration tests)
export async function registerTestUserViaUi(page: Page, user = generateTestUser()) {
	// Navigate to register page and wait for it to load
	await page.goto("/register");
	await page.waitForLoadState("domcontentloaded");
	await page.waitForLoadState("networkidle");
	await expect(page.getByTestId("register-form")).toBeVisible();
	
	// Fill in registration form
	await page.getByTestId("fullname-input").fill(user.fullName);
	await page.getByTestId("email-input").fill(user.email);
	await page.getByTestId("password-input").fill(user.password);
	await page.getByTestId("confirm-password-input").fill(user.password);
	
	// Submit form and wait for response
	try {
		await Promise.all([
			page.waitForResponse(
				response => 
					response.url().includes('/api/auth/register') && 
					response.status() === 201,
				{ timeout: 15000 }
			),
			page.getByTestId("register-button").click(),
		]);

		// Wait for navigation and success message
		await page.waitForURL(/\/login$/, { waitUntil: "networkidle", timeout: 15000 });
		await waitForToast(page, "Account created successfully");
	} catch (error) {
		console.error("Registration failed:", error);
		throw error;
	}

	return user;
}

export async function loginTestUserViaUi(page: Page, user: TestUser) {
	// Navigate to login page and wait for it to load
	await page.goto("/login");
	await page.waitForLoadState("domcontentloaded");
	await page.waitForLoadState("networkidle");
	await expect(page.getByTestId("login-form")).toBeVisible();
	
	// Fill in login form
	await page.getByTestId("email-input").fill(user.email);
	await page.getByTestId("password-input").fill(user.password);
	
	// Submit form and wait for response
	try {
		await Promise.all([
			page.waitForResponse(
				response => 
					response.url().includes('/api/auth/login') && 
					response.status() === 200,
				{ timeout: 15000 }
			),
			page.getByTestId("login-button").click()
		]);
		
		// Wait for navigation and redirect
		await waitForNetworkIdle(page);
		await expectToBeOnPage(page, "/dashboard");
	} catch (error) {
		console.error("Login failed:", error);
		throw error;
	}
}
